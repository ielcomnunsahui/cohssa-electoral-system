import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Award } from 'lucide-react';

interface PromotionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  candidateData: {
    name: string;
    matric: string;
    department: string;
    position: string;
  };
}

export const PromotionConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  candidateData,
}: PromotionConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-success" />
            </div>
            <AlertDialogTitle>Confirm Candidate Promotion</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p className="text-sm">
                You are about to promote the following aspirant to an official candidate:
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold">{candidateData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matric:</span>
                  <span className="font-semibold">{candidateData.matric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold">{candidateData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-semibold">{candidateData.position}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This action will make them visible to voters and allow them to receive votes.
                You can edit their manifesto after promotion.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-success hover:bg-success/90"
          >
            Confirm Promotion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
