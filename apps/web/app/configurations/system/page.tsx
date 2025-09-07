"use client";

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Switch } from '@kit/ui/switch';
import { Textarea } from '@kit/ui/textarea';
import { ArrowLeft, Save, Database, Bell, Globe, Shield, Zap, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SystemConfigurationsPage() {
  const [systemPreferences, setSystemPreferences] = useState({
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    timezone: 'America/New_York',
    autoLogout: 30,
    maxLoginAttempts: 5,
    sessionTimeout: 480
  });

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Payment Gateway', provider: 'Stripe', isActive: true, apiKey: 'sk_test_...', webhookUrl: 'https://api.tajeerplus.com/webhooks/stripe' },
    { id: 2, name: 'SMS Service', provider: 'Twilio', isActive: true, apiKey: 'AC...', webhookUrl: 'https://api.tajeerplus.com/webhooks/twilio' },
    { id: 3, name: 'Email Service', provider: 'SendGrid', isActive: true, apiKey: 'SG...', webhookUrl: 'https://api.tajeerplus.com/webhooks/sendgrid' },
    { id: 4, name: 'Maps Service', provider: 'Google Maps', isActive: false, apiKey: 'AIza...', webhookUrl: '' }
  ]);

  const [notificationSettings, setNotificationSettings] = useState([
    { id: 1, type: 'Email Notifications', enabled: true, frequency: 'Immediate', recipients: 'admin@tajeerplus.com' },
    { id: 2, type: 'SMS Notifications', enabled: true, frequency: 'Immediate', recipients: '+1-555-0123' },
    { id: 3, type: 'Push Notifications', enabled: false, frequency: 'Daily', recipients: 'All Users' },
    { id: 4, type: 'System Alerts', enabled: true, frequency: 'Immediate', recipients: 'admin@tajeerplus.com' }
  ]);

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    scheduledMaintenance: false,
    maintenanceStart: '2024-02-01T02:00:00',
    maintenanceEnd: '2024-02-01T06:00:00',
    backupFrequency: 'daily',
    backupRetention: 30,
    logRetention: 90
  });

  const [apiSettings, setApiSettings] = useState({
    rateLimit: 1000,
    rateLimitWindow: 3600,
    apiVersion: 'v1',
    enableSwagger: true,
    enableRateLimiting: true,
    corsOrigins: 'https://tajeerplus.com,https://admin.tajeerplus.com'
  });

  const updateSystemPreference = (field: string, value: any) => {
    setSystemPreferences({ ...systemPreferences, [field]: value });
  };

  const updateIntegration = (id: number, field: string, value: any) => {
    setIntegrations(integrations.map(integration =>
      integration.id === id ? { ...integration, [field]: value } : integration
    ));
  };

  const updateNotificationSetting = (id: number, field: string, value: any) => {
    setNotificationSettings(notificationSettings.map(setting =>
      setting.id === id ? { ...setting, [field]: value } : setting
    ));
  };

  const updateMaintenanceSetting = (field: string, value: any) => {
    setMaintenanceSettings({ ...maintenanceSettings, [field]: value });
  };

  const updateApiSetting = (field: string, value: any) => {
    setApiSettings({ ...apiSettings, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/configurations">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Configurations
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">System Configurations</h1>
        <p className="text-muted-foreground mt-2">
          Configure system settings, integrations, and preferences for your rental system
        </p>
      </div>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Preferences
          </CardTitle>
          <CardDescription>Basic system configuration and user experience settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Default Language</Label>
              <Select value={systemPreferences.defaultLanguage} onValueChange={(value) => updateSystemPreference('defaultLanguage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={systemPreferences.dateFormat} onValueChange={(value) => updateSystemPreference('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={systemPreferences.timeFormat} onValueChange={(value) => updateSystemPreference('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={systemPreferences.timezone} onValueChange={(value) => updateSystemPreference('timezone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
              <Input
                id="autoLogout"
                type="number"
                value={systemPreferences.autoLogout}
                onChange={(e) => updateSystemPreference('autoLogout', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={systemPreferences.maxLoginAttempts}
                onChange={(e) => updateSystemPreference('maxLoginAttempts', parseInt(e.target.value) || 0)}
                placeholder="5"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>Manage external service integrations and API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor={`integration-name-${integration.id}`}>Service Name</Label>
                  <Input
                    id={`integration-name-${integration.id}`}
                    value={integration.name}
                    onChange={(e) => updateIntegration(integration.id, 'name', e.target.value)}
                    placeholder="Service name"
                  />
                </div>
                <div>
                  <Label htmlFor={`integration-provider-${integration.id}`}>Provider</Label>
                  <Input
                    id={`integration-provider-${integration.id}`}
                    value={integration.provider}
                    onChange={(e) => updateIntegration(integration.id, 'provider', e.target.value)}
                    placeholder="Provider name"
                  />
                </div>
                <div>
                  <Label htmlFor={`integration-api-key-${integration.id}`}>API Key</Label>
                  <Input
                    id={`integration-api-key-${integration.id}`}
                    value={integration.apiKey}
                    onChange={(e) => updateIntegration(integration.id, 'apiKey', e.target.value)}
                    placeholder="API key"
                    type="password"
                  />
                </div>
                <div>
                  <Label htmlFor={`integration-webhook-${integration.id}`}>Webhook URL</Label>
                  <Input
                    id={`integration-webhook-${integration.id}`}
                    value={integration.webhookUrl}
                    onChange={(e) => updateIntegration(integration.id, 'webhookUrl', e.target.value)}
                    placeholder="Webhook URL"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`integration-active-${integration.id}`}
                    checked={integration.isActive}
                    onCheckedChange={(checked) => updateIntegration(integration.id, 'isActive', checked)}
                  />
                  <Label htmlFor={`integration-active-${integration.id}`}>Active</Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure notification preferences and delivery methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{setting.type}</h4>
                    <p className="text-sm text-muted-foreground">Recipients: {setting.recipients}</p>
                  </div>
                  <div className="text-sm text-blue-600">
                    Frequency: {setting.frequency}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`notification-${setting.id}`}
                      checked={setting.enabled}
                      onCheckedChange={(checked) => updateNotificationSetting(setting.id, 'enabled', checked)}
                    />
                    <Label htmlFor={`notification-${setting.id}`}>Enabled</Label>
                  </div>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Configuration
          </CardTitle>
          <CardDescription>Manage API settings, rate limiting, and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rateLimit">Rate Limit (requests)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={apiSettings.rateLimit}
                onChange={(e) => updateApiSetting('rateLimit', parseInt(e.target.value) || 0)}
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="rateLimitWindow">Rate Limit Window (seconds)</Label>
              <Input
                id="rateLimitWindow"
                type="number"
                value={apiSettings.rateLimitWindow}
                onChange={(e) => updateApiSetting('rateLimitWindow', parseInt(e.target.value) || 0)}
                placeholder="3600"
              />
            </div>
            <div>
              <Label htmlFor="apiVersion">API Version</Label>
              <Input
                id="apiVersion"
                value={apiSettings.apiVersion}
                onChange={(e) => updateApiSetting('apiVersion', e.target.value)}
                placeholder="v1"
              />
            </div>
            <div>
              <Label htmlFor="corsOrigins">CORS Origins</Label>
              <Input
                id="corsOrigins"
                value={apiSettings.corsOrigins}
                onChange={(e) => updateApiSetting('corsOrigins', e.target.value)}
                placeholder="https://domain1.com,https://domain2.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableSwagger"
                checked={apiSettings.enableSwagger}
                onCheckedChange={(checked) => updateApiSetting('enableSwagger', checked)}
              />
              <Label htmlFor="enableSwagger">Enable Swagger Documentation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableRateLimiting"
                checked={apiSettings.enableRateLimiting}
                onCheckedChange={(checked) => updateApiSetting('enableRateLimiting', checked)}
              />
              <Label htmlFor="enableRateLimiting">Enable Rate Limiting</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Maintenance & Backup
          </CardTitle>
          <CardDescription>System maintenance mode and backup configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={maintenanceSettings.maintenanceMode}
                onCheckedChange={(checked) => updateMaintenanceSetting('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduledMaintenance"
                checked={maintenanceSettings.scheduledMaintenance}
                onCheckedChange={(checked) => updateMaintenanceSetting('scheduledMaintenance', checked)}
              />
              <Label htmlFor="scheduledMaintenance">Scheduled Maintenance</Label>
            </div>
            <div>
              <Label htmlFor="maintenanceStart">Maintenance Start</Label>
              <Input
                id="maintenanceStart"
                type="datetime-local"
                value={maintenanceSettings.maintenanceStart}
                onChange={(e) => updateMaintenanceSetting('maintenanceStart', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maintenanceEnd">Maintenance End</Label>
              <Input
                id="maintenanceEnd"
                type="datetime-local"
                value={maintenanceSettings.maintenanceEnd}
                onChange={(e) => updateMaintenanceSetting('maintenanceEnd', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select value={maintenanceSettings.backupFrequency} onValueChange={(value) => updateMaintenanceSetting('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="backupRetention">Backup Retention (days)</Label>
              <Input
                id="backupRetention"
                type="number"
                value={maintenanceSettings.backupRetention}
                onChange={(e) => updateMaintenanceSetting('backupRetention', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
            <Textarea
              id="maintenanceMessage"
              value={maintenanceSettings.maintenanceMessage}
              onChange={(e) => updateMaintenanceSetting('maintenanceMessage', e.target.value)}
              placeholder="Message to display during maintenance"
              rows={3}
            />
          </div>
          <div className="mt-4">
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Maintenance Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
