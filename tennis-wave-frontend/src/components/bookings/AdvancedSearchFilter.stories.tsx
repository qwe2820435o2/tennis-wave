import type { Meta, StoryObj } from '@storybook/react';
import AdvancedSearchFilter from './AdvancedSearchFilter';
import { BookingType, BookingStatus, SkillLevel } from '@/types/tennisBooking';

const meta: Meta<typeof AdvancedSearchFilter> = {
  title: 'Bookings/AdvancedSearchFilter',
  component: AdvancedSearchFilter,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSearch: { action: 'search' },
    onReset: { action: 'reset' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    statistics: {
      typeCounts: {
        [BookingType.Singles]: 15,
        [BookingType.Doubles]: 23,
        [BookingType.Casual]: 8,
        [BookingType.Training]: 3,
      },
      statusCounts: {
        [BookingStatus.Pending]: 25,
        [BookingStatus.Confirmed]: 12,
        [BookingStatus.Cancelled]: 5,
        [BookingStatus.Completed]: 18,
      },
      skillLevelCounts: {
        [SkillLevel.Beginner]: 20,
        [SkillLevel.Intermediate]: 35,
        [SkillLevel.Advanced]: 15,
        [SkillLevel.Professional]: 5,
      },
      availableLocations: [
        'Central Tennis Club',
        'Riverside Courts',
        'University Sports Center',
        'Community Park',
        'Elite Tennis Academy'
      ],
    },
  },
};

export const WithActiveFilters: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: '展示当有活跃筛选条件时的组件状态',
      },
    },
  },
};

export const NoStatistics: Story = {
  args: {
    statistics: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: '当没有统计数据时的组件状态',
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '移动端视图下的组件布局',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: '暗色模式下的组件外观',
      },
    },
  },
}; 