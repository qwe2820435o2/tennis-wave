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
        story: 'Component state when there are active filter conditions',
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
        story: 'Component state when there is no statistical data',
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
        story: 'Component layout in mobile view',
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
        story: 'Component appearance in dark mode',
      },
    },
  },
}; 