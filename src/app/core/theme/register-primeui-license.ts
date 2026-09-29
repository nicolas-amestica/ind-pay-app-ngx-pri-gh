import { registerLicense } from '@primeui/license-manager';

/** Shared development license initialization for both application entry points. */
export function registerPrimeUiLicense(): void {
  registerLicense({
    primeui:
      'eyJpZCI6IjdlNGMyMjVmLTM1ZjYtNGM3ZC05OWU4LTJhMDM4NmFhNTQ2NyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTAxNzMwNzksImV4cCI6MTgyMTcwOTA3OX0.VxWUpNiI0EGA62W5969K6U96DaMMPQM5_W1ndAPcMPL5jNWwxLaJopWdd6BofVAk9gmTxu6T-ffnkqu-TuJlDg',
  });
}
