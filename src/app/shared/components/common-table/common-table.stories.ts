import type { Meta, StoryObj } from '@storybook/angular';
import { CommonTableComponent } from './common-table.component';

const meta: Meta<CommonTableComponent> = {
  title: 'Shared/Common Table',
  component: CommonTableComponent,
};

export default meta;
type Story = StoryObj<CommonTableComponent>;

const sampleColumns = [
  { field: 'name', header: 'Name', type: 'text' as const },
  { field: 'role', header: 'Role', type: 'text' as const },
  { field: 'status', header: 'Status', type: 'status' as const },
  { field: 'duration', header: 'Work Hours', type: 'duration' as const },
  { field: 'isActive', header: 'Active', type: 'boolean' as const },
];

const sampleData = [
  { name: 'John Doe', role: 'Software Engineer', status: 'Active', duration: 8.5, isActive: true },
  { name: 'Jane Smith', role: 'HR Manager', status: 'Pending', duration: 32400000, isActive: true }, // 32400000ms = 9h
  { name: 'Bob Johnson', role: 'Product Manager', status: 'Inactive', duration: 0, isActive: false },
];

export const Default: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    hasActions: true,
    showEdit: true,
    showDelete: true,
    showView: true,
  },
};
