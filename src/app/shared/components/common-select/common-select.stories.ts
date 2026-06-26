import type { Meta, StoryObj } from '@storybook/angular';
import { CommonSelectComponent } from './common-select.component';

const meta: Meta<CommonSelectComponent> = {
  title: 'Shared/Common Select',
  component: CommonSelectComponent,
};

export default meta;
type Story = StoryObj<CommonSelectComponent>;

const sampleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'HR Manager', value: 'hr' },
  { label: 'Employee', value: 'employee' },
];

export const Default: Story = {
  args: {
    label: 'Select Role',
    placeholder: 'Choose a role',
    options: sampleOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
};

export const WithError: Story = {
  args: {
    label: 'Select Role',
    placeholder: 'Choose a role',
    options: sampleOptions,
    optionLabel: 'label',
    optionValue: 'value',
    error: 'Role is required',
  },
};
