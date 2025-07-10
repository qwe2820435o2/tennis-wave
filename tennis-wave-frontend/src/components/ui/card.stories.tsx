import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { ThemeProvider } from 'next-themes';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component for displaying content and actions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Custom CSS class name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card. You can put any content here.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="p-6">
        <p>Simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px] overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600" />
      <CardHeader>
        <CardTitle>Card with Image</CardTitle>
        <CardDescription>This card has an image area at the top.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The image area can contain any content or actual images.</p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover over this card to see the effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has hover effects and can be made interactive.</p>
      </CardContent>
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card with Actions</CardTitle>
        <CardDescription>This card has multiple action buttons.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content goes here.</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="outline" size="sm">Share</Button>
        <Button size="sm">Delete</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Compact Card</CardTitle>
        <CardDescription>Smaller padding for compact layout.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p>This card uses smaller padding for a more compact appearance.</p>
      </CardContent>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Card 1</CardTitle>
          <CardDescription>First card in the grid.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 1.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card 2</CardTitle>
          <CardDescription>Second card in the grid.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 2.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Card 3</CardTitle>
          <CardDescription>Third card in the grid.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for card 3.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="bg-gray-900 p-8 rounded-lg">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Dark Mode Card</CardTitle>
            <CardDescription>This card is displayed in dark mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Notice how the card adapts to the dark theme.</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      </div>
    </ThemeProvider>
  ),
}; 