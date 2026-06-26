import type { Meta, StoryObj } from '@storybook/angular';
import { CommonTimePickerComponent } from './common-time-picker.component';

const meta: Meta<CommonTimePickerComponent> = {
  title: 'Shared/Datepicker/Common Time Picker',
  component: CommonTimePickerComponent,
};

export default meta;
type Story = StoryObj<CommonTimePickerComponent>;

export const Default: Story = {
  args: {
    label: 'Select Time',
    placeholder: 'Choose time...',
  },
};
