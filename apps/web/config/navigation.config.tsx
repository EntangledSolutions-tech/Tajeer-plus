// Icons are now handled in the sidebar component using custom SVG icons
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

// Icon classes are no longer needed since icons are handled in sidebar component

const routes = [
  {
    label: 'Dashboard',
    children: [
      {
        label: 'Dashboard',
        path: '/home',
        Icon: null, // Icons are now handled in the sidebar component
        end: true,
      },
    ],
  },
  {
    label: 'Vehicles',
    children: [
      {
        label: 'Vehicles',
        path: pathsConfig.app.vehicles,
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/vehicles'),
      },
    ],
  },
  {
    label: 'Customers',
    children: [
      {
        label: 'Customers',
        path: '/customers',
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/customers'),
      },
    ],
  },
  {
    label: 'Companies',
    children: [
      {
        label: 'Companies',
        path: '/companies',
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/companies'),
      },
    ],
  },
  {
    label: 'Contracts',
    children: [
      {
        label: 'Contracts',
        path: '/contracts',
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/contracts'),
      },
    ],
  },
  {
    label: 'Finance',
    children: [
      {
        label: 'Finance',
        path: '/finance',
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/finance'),
      },
    ],
  },
  {
    label: 'Reports',
    children: [
      {
        label: 'Reports',
        path: '/reports',
        Icon: null, // Icons are now handled in the sidebar component
      },
    ],
  },
  {
    label: 'Inspections',
    children: [
      {
        label: 'Inspections',
        path: pathsConfig.app.inspections,
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/inspections'),
      },
    ],
  },
  {
    label: 'Configurations',
    children: [
      {
        label: 'Configurations',
        path: '/configurations',
        Icon: null, // Icons are now handled in the sidebar component
        end: (path: string) => !path.startsWith('/configurations'),
      },
    ],
  },
  {
    label: 'Help',
    children: [
      {
        label: 'Help',
        path: '/help',
        Icon: null, // Icons are now handled in the sidebar component
      },
    ],
  },
];

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
