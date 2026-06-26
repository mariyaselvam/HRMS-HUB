import type { Meta, StoryObj } from '@storybook/angular';
import { CommonMonthPickerComponent } from './common-month-picker.component';

const meta: Meta<CommonMonthPickerComponent> = {
  title: 'Shared/Datepicker/Common Month Picker',
  component: CommonMonthPickerComponent,
};

export default meta;
type Story = StoryObj<CommonMonthPickerComponent>;

export const Default: Story = {
  args: {
    label: 'Select Month',
  },
};
