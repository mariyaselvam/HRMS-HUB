import type { Preview } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { setCompodocJson } from "@storybook/addon-docs/angular";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import docJson from "../documentation.json";

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideAnimationsAsync(),
        MessageService,
        ConfirmationService,
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: '.my-app-dark',
              cssLayer: {
                name: 'primeng',
                order: 'theme, base, primeng'
              }
            }
          }
        })
      ]
    })
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;