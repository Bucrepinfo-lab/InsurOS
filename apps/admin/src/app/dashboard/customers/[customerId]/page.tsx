import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type ContactRow = {
  type: string;
  value: string;
  primary: string;
  verified: string;
};

const contacts: ContactRow[] = [
  {
    type: 'Email',
    value: 'customer@insuros.local',
    primary: 'Yes',
    verified: 'No'
  },
  {
    type: 'Phone',
    value: '+254700000000',
    primary: 'No',
    verified: 'No'
  }
];

const columns: DataTableColumn<ContactRow>[] = [
  { key: 'type', header: 'Type' },
  { key: 'value', header: 'Value' },
  {
    key: 'primary',
    header: 'Primary',
    render: (row) => (
      <Badge tone={row.primary === 'Yes' ? 'success' : 'neutral'}>
        {row.primary}
      </Badge>
    )
  },
  {
    key: 'verified',
    header: 'Verified',
    render: (row) => (
      <Badge tone={row.verified === 'Yes' ? 'success' : 'warning'}>
        {row.verified}
      </Badge>
    )
  }
];

export default function CustomerContactsPage() {
  return (
    <DomainModulePage
      title='Customer Contacts'
      description='Manage customer contact points, verification status, and primary communication preferences.'
      actions={<Button>Add Contact</Button>}
    >
      <DomainEntityList
        title='Contact Points'
        description='Email, phone, WhatsApp, and other communication channels for this customer.'
        searchPlaceholder='Search contacts...'
        columns={columns}
        data={contacts}
        emptyTitle='No contacts'
        emptyDescription='Add the first contact point for this customer.'
        emptyAction={<Button>Add Contact</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}