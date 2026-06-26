import type { Meta, StoryObj } from '@storybook/angular';
import { CommonInputComponent } from './common-input.component';

const meta: Meta<CommonInputComponent> = {
  title: 'Shared/Common Input',
  component: CommonInputComponent,
  argTypes: {
    type: {
      control: 'text',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<CommonInputComponent>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search resources...',
    icon: 'pi pi-search',
    iconPosition: 'left',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Read Only Input',
    placeholder: 'You cannot edit this',
  },
  render: (args) => ({
    props: args,
    template: `<app-common-input [label]="label" [placeholder]="placeholder" [disabled]="true"></app-common-input>`,
  }),
};
