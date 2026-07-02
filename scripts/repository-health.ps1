Write-Host ""
Write-Host "InsurOS Repository Health Check"
Write-Host "--------------------------------"

$failed = $false

function Pass($message) {
    Write-Host "[PASS] $message"
}

function Fail($message) {
    Write-Host "[FAIL] $message"
    $script:failed = $true
}

if (Test-Path "package.json") { Pass "Root package.json exists" } else { Fail "Root package.json missing" }
if (Test-Path "pnpm-workspace.yaml") { Pass "pnpm workspace exists" } else { Fail "pnpm workspace missing" }
if (Test-Path "apps/admin/src/lib/routes.ts") { Pass "Routes file exists" } else { Fail "Routes file missing" }
if (Test-Path "docs/ENGINEERING_STANDARDS.md") { Pass "Engineering standards found" } else { Fail "Engineering standards missing" }
if (Test-Path "docs/ARCHITECTURE_BASELINE_v1.md") { Pass "Architecture baseline found" } else { Fail "Architecture baseline missing" }
if (Test-Path "docs/PLATFORM_FOUNDATION.md") { Pass "Platform foundation found" } else { Fail "Platform foundation missing" }

$pageTxs = Get-ChildItem -Recurse -Filter "page.txs" -ErrorAction SilentlyContinue
if ($pageTxs.Count -eq 0) { Pass "No accidental page.txs files" } else { Fail "Found page.txs files" }

$badDocs = Test-Path "docs/architecture/docs"
if (-not $badDocs) { Pass "No accidental docs/architecture/docs folder" } else { Fail "Unexpected docs/architecture/docs folder exists" }

$gitStatus = git status --porcelain
if ([string]::IsNullOrWhiteSpace($gitStatus)) { Pass "Working tree clean" } else { Fail "Working tree not clean" }

Write-Host ""

if ($failed) {
    Write-Host "Repository Health: FAILED"
    exit 1
}

Write-Host "Repository Health: PASSED"
exit 0
