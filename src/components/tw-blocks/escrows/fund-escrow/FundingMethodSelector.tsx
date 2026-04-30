"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RozoFundEscrow } from "./RozoFundEscrow";
import { FundEscrowForm } from "@/components/tw-blocks/escrows/single-multi-release/fund-escrow/form/FundEscrow";

interface FundingMethodSelectorProps {
  contractId: string;
  escrowPublicKey: string;
  isMultiRelease: boolean;
}

export function FundingMethodSelector({
  contractId,
  escrowPublicKey,
  isMultiRelease,
}: FundingMethodSelectorProps) {
  return (
    <Tabs defaultValue="stellar" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stellar">Stellar Direct</TabsTrigger>
        <TabsTrigger value="rozo">Fund from Other Chains</TabsTrigger>
      </TabsList>

      <TabsContent value="stellar" className="space-y-6 mt-6">
        <FundEscrowForm />
      </TabsContent>

      <TabsContent value="rozo" className="space-y-6 mt-6">
        <RozoFundEscrow
          contractId={contractId}
          escrowPublicKey={escrowPublicKey}
          onPaymentCreated={(paymentId) => {
            console.log("[ROZO] Payment created:", paymentId);
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
