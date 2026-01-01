export function DealTerms() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
      <h3 className="text-xl font-display font-medium mb-4">
        Plans & Features
      </h3>

      <div className="mb-6">
        <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 tracking-wide">
          Deal Terms
        </h4>
        <ul className="space-y-2 text-primary/80">
          <li className="flex gap-2">
            ✅ <span>Lifetime access to DropMyDeal Plan</span>
          </li>
          <li className="flex gap-2">
            ✅{' '}
            <span>You must redeem your code(s) within 60 days of purchase</span>
          </li>
          <li className="flex gap-2">
            ✅ <span>All future Plan updates</span>
          </li>
          <li className="flex gap-2">
            ✅ <span>60-day money-back guarantee, no matter the reason</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 tracking-wide">
          Features Included
        </h4>
        <ul className="grid md:grid-cols-2 gap-2 text-primary/80">
          <li className="flex gap-2">
            🔹 <span>Unlimited Projects</span>
          </li>
          <li className="flex gap-2">
            🔹 <span>White-labeling</span>
          </li>
          <li className="flex gap-2">
            🔹 <span>Custom Domain</span>
          </li>
          <li className="flex gap-2">
            🔹 <span>API Access</span>
          </li>
          <li className="flex gap-2">
            🔹 <span>24/7 Support</span>
          </li>
          <li className="flex gap-2">
            🔹 <span>Remove Branding</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
