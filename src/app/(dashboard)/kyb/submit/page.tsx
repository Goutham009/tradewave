import { KYBForm } from '../components/KYBForm';

export default function KYBSubmitPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Business Verification (KYB)</h1>
        <p className="text-gray-600 mt-2">
          Complete your business verification to unlock all platform features and build trust with trading partners.
        </p>
      </div>
      <KYBForm />
    </div>
  );
}
