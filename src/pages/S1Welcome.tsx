import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Gauge, Search, MessageCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { OfflineBanner } from '../components/OfflineBanner';
import { Toast } from '../components/Toast';

export const S1Welcome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && (location.state as { deleted?: boolean }).deleted) {
      setToastMessage('Your account and all your data have been deleted.');
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-pageBackground flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-md mx-auto">
      <OfflineBanner />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
        {/* 1. Logo */}
        <div className="mb-8">
          <Logo height={32} />
        </div>

        {/* 2. Title */}
        <h1 className="text-2xl font-semibold text-mainText mb-4 tracking-tight">
          See your money the way a lender does.
        </h1>

        {/* 3. Body text */}
        <p className="text-base text-secondaryText mb-8 max-w-sm">
          Check your debt-to-income ratio, spot double charges and ask questions in plain English. Free, private and built for South Africans.
        </p>

        {/* 4. 3 benefit rows */}
        <div className="w-full max-w-sm space-y-4 mb-10 text-left">
          <div className="flex items-center gap-3">
            <div className="text-primary flex-shrink-0">
              <Gauge className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-base text-mainText font-medium">
              Know your DTI and status band
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-primary flex-shrink-0">
              <Search className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-base text-mainText font-medium">
              Spot double charges and unusual amounts
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-primary flex-shrink-0">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-base text-mainText font-medium">
              Ask questions about your own numbers
            </span>
          </div>
        </div>

        {/* 5 & 6. Buttons */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/sign-up')}
          >
            Create account
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/log-in')}
          >
            Log in
          </Button>
        </div>

        {/* 7. Disclaimer */}
        <p className="text-xs sm:text-sm text-secondaryText text-center max-w-xs">
          CreditWise AI explains and educates. It does not give financial advice or credit.
        </p>
      </div>
    </div>
  );
};
