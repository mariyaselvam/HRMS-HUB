import type { Meta, StoryObj } from '@storybook/angular';
import { CommonDatePickerComponent } from './common-date-picker.component';

const meta: Meta<CommonDatePickerComponent> = {
  title: 'Shared/Common Datepicker',
  component: CommonDatePickerComponent,
};

export default meta;

type Story = StoryObj<CommonDatePickerComponent>;

export const Default: Story = {
  args: {},
};
