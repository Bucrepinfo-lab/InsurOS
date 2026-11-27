'use server';

import { revalidatePath } from 'next/cache';
import { getAuthStore, PrincipalService, StaffProfileService, type ProfilePerson } from '@insuros/services';
import type { ProfileChangeField, SessionPrincipal } from '@insuros/domain';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';

/**
 * My record (owner 27/11/26): the person changes their own photo and work email
 * at once; their name and sign-in number change through a request decided at
 * Governance. Every action works only on the signed-in person's own record.
 */

async function me(principal: SessionPrincipal): Promise<(ProfilePerson & { owner: boolean }) | null> {
  const phone = principal.phone;
  if (!phone) return null;
  const appointment = await new PrincipalService().staffAppointmentForPhone(phone);
  if (appointment) {
    return { userId: appointment.userId, userName: appointment.userName, phone, regionId: appointment.regionId, owner: false };
  }
  if (principal.isPlatformOwner) {
    return { userId: `owner-${phone.replace(/\D/g, '')}`, userName: principal.name, phone, regionId: '', owner: true };
  }
  return null;
}

export async function saveMyWorkEmail(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const person = await me(auth.principal);
  if (!person) return fail('Not saved', 'Your record could not be found.');
  const saved = await new StaffProfileService().setEmail(person.userId, String(formData.get('email') ?? ''));
  if (!saved.ok) return fail('Not saved', saved.error);
  revalidatePath('/dashboard/my-record');
  return ok('Email saved', saved.value ? `Documents and replies can now show ${saved.value}.` : 'Your work email was removed.');
}

export async function saveMyPhoto(formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const person = await me(auth.principal);
  if (!person) return fail('Photo not saved', 'Your record could not be found.');
  const file = formData.get('photo');
  if (!(file instanceof Blob)) return fail('Photo not saved', 'Choose a photo first.');
  const saved = await new StaffProfileService().setPhoto(person.userId, new Uint8Array(await file.arrayBuffer()));
  if (!saved.ok) return fail('Photo not saved', saved.error);
  revalidatePath('/dashboard/my-record');
  return ok('Photo saved', 'Your new photo shows on your record.');
}

export async function removeMyPhoto(): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const person = await me(auth.principal);
  if (!person) return fail('Photo not removed', 'Your record could not be found.');
  await new StaffProfileService().removePhoto(person.userId);
  revalidatePath('/dashboard/my-record');
  return ok('Photo removed', 'Your record shows your initials again.');
}

export async function askToCorrect(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const person = await me(auth.principal);
  if (!person) return fail('Request not sent', 'Your record could not be found.');
  if (person.owner) return fail('Request not sent', 'A platform owner’s name and number are set in the platform settings.');
  const field = String(formData.get('field') ?? '') as ProfileChangeField;
  if (field !== 'name' && field !== 'phone') return fail('Request not sent', 'Choose what to correct.');
  const asked = await new StaffProfileService().request(person, field, String(formData.get('to') ?? ''), String(formData.get('reason') ?? ''));
  if (!asked.ok) return fail('Request not sent', asked.error);
  revalidatePath('/dashboard/my-record');
  revalidatePath('/dashboard/governance/access');
  return ok(
    'Request sent',
    field === 'name'
      ? 'The person who manages access will check it against your ID or licence. You will see the answer here.'
      : 'Once it is approved, sign in with the new number and your same PIN. Your phones will be signed out.',
    { reference: asked.value.id }
  );
}

/** Governance: approve or decline a correction. Same permission as granting access, only in the decider's regions. */
export async function decideCorrection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Identity', 'Create');
  if (!auth.ok) return auth.result;
  const decider = await me(auth.principal);
  const approve = formData.get('decision') === 'approve';
  const decided = await new StaffProfileService().decide(
    {
      id: String(formData.get('id') ?? ''),
      approve,
      note: String(formData.get('note') ?? ''),
      decidedBy: auth.principal.phone ?? auth.principal.email,
      deciderUserId: decider?.userId ?? '',
      regionIds: auth.principal.isPlatformOwner ? 'all' : auth.principal.accessibleRegionIds
    },
    getAuthStore()
  );
  if (!decided.ok) return fail('Not decided', decided.error);
  revalidatePath('/dashboard/governance/access');
  const r = decided.value;
  if (!approve) return ok('Request declined', `${r.userName} sees your reason on their record.`, { reference: r.id });
  return ok(
    'Correction approved',
    r.field === 'name'
      ? `${r.from} is now ${r.to} on every record.`
      : `${r.userName} now signs in with ${r.to} and the same PIN. Their phones were signed out.`,
    { reference: r.id }
  );
}
