# @simmcomm/react-hooks

A library with set of React/NextJS hooks commonly used in SimmComm projects.

## Installation

Add `@simmcomm/react-hooks` to your project.

```shell
npm add @simmcomm/react-hooks
```

This project defines the following peer dependencies:

- `react`
- `react-dom`
- `next`
- `@simmcomm/internal-agency-client`

They must be installed in your project and match the version as defined in [package.json](package.json).

## Usage

In your layout component:

```tsx
import { InternalAgencyClientProvider } from "@simmcomm/react-hooks";

const InternalAgencyClientConfig = {
  apiEndpoint: process.env.NEXT_PUBLIC_IA_CLIENT_ENDPOINT || '___default_value___',
  serviceId: process.env.NEXT_PUBLIC_IA_CLIENT_SERVICE || '___default_value___',
  campaignId: process.env.NEXT_PUBLIC_IA_CLIENT_CAMPAIGN || '___default_value___',
};

export default const Layout = ({ children }) => {
  return (
      {/* other html */ }
      <body>
      {/* children must be wrapped in InternalAgencyClientProvider */}
          <InternalAgencyClientProvider config={InternalAgencyClientConfig}>
            {children}
          </InternalAgencyClientProvider>
      </body>
      {/* other html */}
  );
};

```

In components below the provider:
```tsx
import { useInternalAgencyClient } from "@simmcomm/react-hooks";

export default const MyComponent = () => {
  const { client, initialized: clientInitialized, initializing } = useInternalAgencyClient();
  
  return <>
      My frid: {clientInitialized ? client?.fridStore.getFrid() : 'initializing'}}
  </>;
};

```

Client is automatically initialized when the provider is mounted.
Any API calls must be made after the client is initialized - determined by `initialized` flag.
