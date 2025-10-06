import { createInternalAgencyClient } from '@simmcomm/internal-agency-client';

export type ClientConfig = Parameters<typeof createInternalAgencyClient>[0];
export const clientConfigMock: ClientConfig = { serviceId: 'test-service', campaignId: 'test-campaign' };
