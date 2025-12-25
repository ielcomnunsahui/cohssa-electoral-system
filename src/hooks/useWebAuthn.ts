import { useState, useCallback } from 'react';
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
}

export const useWebAuthn = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkSupport = useCallback(() => {
    try {
      const supported = browserSupportsWebAuthn();
      setIsSupported(supported);
      return supported;
    } catch (error) {
      console.warn('WebAuthn check failed:', error);
      setIsSupported(false);
      return false;
    }
  }, []);

  const registerCredential = useCallback(async (userId: string, userName: string): Promise<WebAuthnCredential | null> => {
    setIsLoading(true);
    try {
      // Generate challenge for registration
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBase64 = btoa(String.fromCharCode(...challenge));

      const registrationOptions = {
        challenge: challengeBase64,
        rp: {
          name: 'ISECO Election System',
          id: window.location.hostname,
        },
        user: {
          id: btoa(userId),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' as const },
          { alg: -257, type: 'public-key' as const },
        ],
        timeout: 60000,
        attestation: 'none' as const,
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as const,
          userVerification: 'required' as const,
          residentKey: 'preferred' as const,
        },
      };

      const credential = await startRegistration({ optionsJSON: registrationOptions });

      const webauthnCredential: WebAuthnCredential = {
        credentialId: credential.id,
        publicKey: credential.response.publicKey || '',
        counter: 0,
      };

      return webauthnCredential;
    } catch (error: any) {
      console.error('WebAuthn registration error:', error);
      // Don't show toast here - let the caller handle fallback gracefully
      // The error will be caught and handled by the registration flow
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (credentialId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBase64 = btoa(String.fromCharCode(...challenge));

      const authenticationOptions = {
        challenge: challengeBase64,
        timeout: 60000,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key' as const,
            transports: ['internal' as const],
          },
        ],
        userVerification: 'required' as const,
      };

      await startAuthentication({ optionsJSON: authenticationOptions });
      return true;
    } catch (error: any) {
      console.error('WebAuthn authentication error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Biometric authentication was cancelled');
      } else {
        toast.error('Biometric authentication failed');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCredential = useCallback(async (
    matric: string, 
    credential: WebAuthnCredential
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('voters')
        .update({ webauthn_credential: credential as any })
        .ilike('matric_number', matric);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save WebAuthn credential:', error);
      return false;
    }
  }, []);

  const getCredential = useCallback(async (email: string): Promise<WebAuthnCredential | null> => {
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('webauthn_credential')
        .eq('email', email)
        .maybeSingle();

      if (error || !data?.webauthn_credential) return null;
      return data.webauthn_credential as unknown as WebAuthnCredential;
    } catch (error) {
      console.error('Failed to get WebAuthn credential:', error);
      return null;
    }
  }, []);

  return {
    isSupported,
    isLoading,
    checkSupport,
    registerCredential,
    authenticate,
    saveCredential,
    getCredential,
  };
};
