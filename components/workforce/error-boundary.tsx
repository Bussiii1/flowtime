'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component to catch runtime errors in the component tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/5 rounded-2xl border-2 border-destructive/20 min-h-[300px]">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-black mb-2">Quelque chose s'est mal passé</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Une erreur inattendue est survenue lors de l'affichage de ce composant. 
            Veuillez recharger la page ou réessayer plus tard.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            className="font-bold shadow-lg shadow-primary/20"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Réessayer
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
