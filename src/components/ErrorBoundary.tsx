import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  let errorMessage = "Algo salió mal. Por favor, intenta de nuevo.";
  let isFirestoreError = false;

  const err = error as any;

  try {
    if (err?.message) {
      const parsed = JSON.parse(err.message);
      if (parsed.error && parsed.operationType) {
        isFirestoreError = true;
        errorMessage = `Error de base de datos (${parsed.operationType}): ${parsed.error}`;
      }
    }
  } catch (e) {
    errorMessage = err?.message || errorMessage;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <Card className="bg-neutral-900 border-red-500/50 max-w-md w-full text-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold">¡Vaya! Ha ocurrido un error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-neutral-400 text-sm">
            {errorMessage}
          </p>
          {isFirestoreError && (
            <p className="text-xs text-neutral-500 italic">
              Esto puede deberse a problemas de conexión o permisos.
            </p>
          )}
          <Button 
            onClick={() => {
              resetErrorBoundary();
              window.location.reload();
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
