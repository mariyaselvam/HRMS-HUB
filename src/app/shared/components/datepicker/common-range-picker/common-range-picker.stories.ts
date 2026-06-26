import type { Meta, StoryObj } from '@storybook/angular';
import { CommonRangePickerComponent } from './common-range-picker.component';

const meta: Meta<CommonRangePickerComponent> = {
  title: 'Shared/Datepicker/Common Range Picker',
  component: CommonRangePickerComponent,
};

export default meta;
type Story = StoryObj<CommonRangePickerComponent>;

export const Default: Story = {
  args: {
    label: 'Select Date Range',
    placeholder: 'Choose range...',
  },
};
