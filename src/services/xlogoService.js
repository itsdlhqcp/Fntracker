
import React, { useState, useEffect, useCallback } from 'react';

// Logo Service
const logoService = {
  async getAssetLogo(symbol, exchange = 'NSE') {
    try {
      // Hardcoded URL as requested - using the exact URL from your original code
      const url = 'https://api.findouts.news/v1/portfolio-mgr/api/asset/logos?symbol=HDFCBANK&exchange=NSE';
      
      console.log('🚀 Fetching logo from HARDCODED URL:', url);
      console.log('📝 Requested Symbol:', symbol, 'Exchange:', exchange);
      console.log('⚠️  NOTE: Using hardcoded URL regardless of input parameters');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyN2I4ZmI2N2JiYWQ3NzQ0NWU1ZmVhNGM3MWFhOTg0NmQ3ZGRkMDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNzkwMTgzMTQ5NDctNDFkcjhuZDlxZWk1am9qcDkwNHJidXY3MjZkOHN2ZHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNzkwMTgzMTQ5NDctNDFkcjhuZDlxZWk1am9qcDkwNHJidXY3MjZkOHN2ZHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU5NDA2MDU0MTc4OTAwODkwODYiLCJlbWFpbCI6ImRpbGhhcXVlY3BAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ4VXJiZktIXy0xa0dTVGREbXFIUzBnIiwibmFtZSI6IkRpbGhhcXVlIEFoZW1tZWQgQyBQIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tsWFJ2cWhKLXZnNjNFdW8wZzE0a2lOMERuTE05UkQ2ZkN3OFpjbW1jSDZNTjhUM0k9czk2LWMiLCJnaXZlbl9uYW1lIjoiRGlsaGFxdWUiLCJmYW1pbHlfbmFtZSI6IkFoZW1tZWQgQyBQIiwiaWF0IjoxNzU4NzM3NjI2LCJleHAiOjE3NTg3NDEyMjZ9.cfGTap0GDluMeHBPhmlOydKc14M-rJePJmsPqqb1yoWNUWAw29VyoZELtTOAKvhKBdrsZtl0i5opONBtbTA_xNHqwoNTMBWsyqBv-1eJLl7Ft-J4MSpaSlXGG8GfjorK8QnKDKj_x-WD3fW4fP-CQRPJmoZOZZyIhFJCyuEdSNgRYby1tGgy_PAHH9vQTCiC_26OHI-fBGY5eDWAVGQKfFx3r8W7El5ZgZqirVoa5gdIO-jPTHZkIxIGOyg1UwDhVBgbBcw2aic4PHhlIfoM65-poQkXHWr5IKTGnFwAy3Gic3xi2Pc26HaV4JkIkR70gGPuBI1NpYh-Zo_x-CYJyg'
        }
      });

      console.log('📊 Response Details:');
      console.log('   - Status:', response.status);
      console.log('   - Status Text:', response.statusText);
      console.log('   - OK:', response.ok);
      
      // Log all response headers
      console.log('📋 Response Headers:');
      for (let [key, value] of response.headers.entries()) {
        console.log(`   - ${key}: ${value}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response Body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('🎭 Content-Type:', contentType);
      
      const blob = await response.blob();
      console.log('💾 Blob Details:');
      console.log('   - Size:', blob.size, 'bytes');
      console.log('   - Type:', blob.type);
      console.log('   - Is Empty:', blob.size === 0);
      
      if (blob.size === 0) {
        throw new Error('Received empty response - blob size is 0');
      }
      
      console.log('✅ Successfully received logo blob!');
      return blob;
    } catch (error) {
      console.error('💥 LOGO SERVICE ERROR:');
      console.error('   - Error Type:', error.constructor.name);
      console.error('   - Error Message:', error.message);
      console.error('   - Full Error:', error);
      throw error;
    }
  }
};