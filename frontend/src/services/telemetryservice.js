import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Initialize Application Insights for Azure monitoring
let appInsights = null;

// This configuration should come from environment variables in a real application
const INSTRUMENTATION_KEY = process.env.REACT_APP_APPINSIGHTS_INSTRUMENTATIONKEY;

// Only initialize if we have an instrumentation key
if (INSTRUMENTATION_KEY) {
  appInsights = new ApplicationInsights({
    config: {
      connectionString: `InstrumentationKey=${INSTRUMENTATION_KEY}`,
      enableAutoRouteTracking: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      enableAjaxErrorStatusText: true,
      enableAjaxPerfTracking: true,
      enableCorsCorrelation: true,
      disableFetchTracking: false
    }
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
  console.log('Application Insights initialized');
}

// Export a telemetry service that's safe to use even if App Insights isn't initialized
export const telemetryService = {
  trackEvent: (event) => {
    if (appInsights) {
      appInsights.trackEvent(event);
    }
  },
  
  trackException: (exception) => {
    if (appInsights) {
      appInsights.trackException(exception);
    }
  },
  
  trackMetric: (metric) => {
    if (appInsights) {
      appInsights.trackMetric(metric);
    }
  },
  
  trackTrace: (trace) => {
    if (appInsights) {
      appInsights.trackTrace(trace);
    }
  },
  
  trackPageView: (pageView) => {
    if (appInsights) {
      appInsights.trackPageView(pageView);
    }
  },
  
  flush: () => {
    if (appInsights) {
      appInsights.flush();
    }
  }
};