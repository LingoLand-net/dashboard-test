// Centralized API client for communicating with the Google Apps Script Web App
import { WEB_APP_URL } from './config.js';

// Multiple CORS proxies - try them in order
// Try various CORS proxy solutions since they can be unreliable
const CORS_PROXIES = [
  {
    name: 'cors.bridged.cc',
    prefix: 'https://cors.bridged.cc/?url=',
    extractData: (response) => response
  },
  {
    name: 'allorigins.win',
    prefix: 'https://api.allorigins.win/get?url=',
    extractData: (response) => JSON.parse(response.contents)
  },
  {
    name: 'corsproxy.io',
    prefix: 'https://corsproxy.io/?',
    extractData: (response) => response
  }
];

async function tryWithProxy(url, opts, proxyIndex = 0) {
  if (proxyIndex >= CORS_PROXIES.length) {
    // No more proxies to try, throw error
    throw new Error('All CORS proxies failed. Unable to reach the API.');
  }

  const proxy = CORS_PROXIES[proxyIndex];
  const proxyUrl = proxy.prefix + encodeURIComponent(url.toString());

  try {
    const res = await fetch(proxyUrl, opts);
    const text = await res.text();
    
    // Check if response is HTML (error page) instead of JSON
    if (text.startsWith('<') || text.startsWith('<!')) {
      throw new Error(`Proxy returned HTML instead of JSON. Proxy may be down or URL invalid.`);
    }
    
    // Try to parse JSON
    try {
      const response = JSON.parse(text);
      // Extract actual data using proxy-specific extractor
      const data = proxy.extractData(response);
      return data;
    } catch (parseErr) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  } catch (err) {
    console.warn(`Proxy ${proxyIndex} (${proxy.name}) failed:`, err.message);
    // Try next proxy
    return tryWithProxy(url, opts, proxyIndex + 1);
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(path, WEB_APP_URL);
  if (params) Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));

  const opts = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    // Try CORS proxies first
    return await tryWithProxy(url, opts);
  } catch (proxyErr) {
    console.warn('All CORS proxies failed, trying direct fetch as fallback...');
    
    // Fallback: try direct fetch (will fail with CORS but good for error message)
    try {
      const res = await fetch(url.toString(), opts);
      const text = await res.text();
      
      if (text.startsWith('<') || text.startsWith('<!')) {
        throw new Error(`Backend returned HTML. Check if the URL is correct.`);
      }
      
      return JSON.parse(text);
    } catch (directErr) {
      // All methods failed
      throw new Error(`API unreachable: ${proxyErr.message}`);
    }
  }
}

/**
 * Universal API call function
 * @param {string} resource - The resource (students, payments, attendance, etc.)
 * @param {string} action - The action (list, create, update, delete, etc.)
 * @param {object} body - Request body for POST/PUT
 * @param {object} params - Query parameters
 * @returns {Promise<object>} Response object {ok, data, error}
 */
export async function apiCall(resource, action, body = {}, params = {}) {
  try {
    // Build the URL path: ?resource=X&action=Y
    const queryParams = {
      resource,
      action,
      ...params
    };
    
    const response = await request(WEB_APP_URL, {
      method: body && Object.keys(body).length > 0 ? 'POST' : 'GET',
      body: Object.keys(body).length > 0 ? body : undefined,
      params: queryParams
    });
    
    return response;
  } catch (err) {
    console.error('API call failed:', err);
    return {
      ok: false,
      error: err.message
    };
  }
}

export default { request, apiCall };
