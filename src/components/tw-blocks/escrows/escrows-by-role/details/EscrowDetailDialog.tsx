"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useEscrowDetailDialog from "./useDetailsEscrow";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Info, Users, ListChecks, Building, BarChart3 } from "lucide-react";
import { useEscrowDialogs } from "@/components/tw-blocks/providers/EscrowDialogsProvider";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Milestones } from "./Milestones";
import { Entities } from "./Entities";
import { GeneralInformation } from "./GeneralInformation";
import { RelatedEscrows } from "./RelatedEscrows";
import { EscrowMilestoneProgressBar } from "../../indicators/milestone-progress/bar/EscrowMilestoneProgress";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { SuccessReleaseDialog } from "./SuccessReleaseDialog";

/**
 * Based on the provided roles -> https://docs.trustlesswork.com/trustless-work/technology-overview/roles-in-trustless-work
 *
 * The roles that the user assigns in the escrow initialization are in the userRolesInEscrow state. Based on these roles, you'll have different actions buttons.
 *
 */

interface EscrowDetailDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  setSelectedEscrow: (selectedEscrow?: Escrow) => void;
  /**
   * Optional tab to activate when the dialog opens. Defaults to "general".
   * Passing a value allows callers (e.g. the approver table) to immediately
   * show the progress section when opening from a specific action.
   */
  initialTab?: "general" | "entities" | "milestones" | "progress" | "related";
}

export const EscrowDetailDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  setSelectedEscrow,
  initialTab,
}: EscrowDetailDialogProps) => {
  const { selectedEscrow } = useEscrowContext();
  const dialogStates = useEscrowDialogs();
  const [activeTab, setActiveTab] = useState<string>(
    // start with the provided tab or fall back to the default
    initialTab ?? "general"
  );

  // whenever the dialog is opened (or the requested initialTab changes) reset
  // the active tab so that callers can control what the user sees first.
  React.useEffect(() => {
    if (isDialogOpen) {
      setActiveTab(initialTab ?? "general");
    }
  }, [isDialogOpen, initialTab]);

  const {
    handleClose,
    setEvidenceVisibleMap,
    evidenceVisibleMap,
    areAllMilestonesApproved,
    userRolesInEscrow,
  } = useEscrowDetailDialog({
    setIsDialogOpen,
    setSelectedEscrow,
    selectedEscrow,
  });

  const viewerUrl = `https://viewer.trustlesswork.com/${selectedEscrow?.contractId}`;

  if (!isDialogOpen || !selectedEscrow) return null;
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="w-11/12 sm:w-3/4 h-[95vh] overflow-y-auto flex flex-col !max-w-none">
          <DialogHeader className="flex-shrink-0">
            <div className="w-full">
              <div className="flex flex-col gap-2">
                <Link
                  href={viewerUrl}
                  target="_blank"
                  className="hover:underline w-fit"
                >
                  <DialogTitle className="text-xl">
                    {selectedEscrow.title}
                  </DialogTitle>
                </Link>

                <DialogDescription>
                  {selectedEscrow.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="general"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50">
              <TabsTrigger
                value="general"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Info className="h-4 w-4 hidden md:block" />
                <span>Information</span>
              </TabsTrigger>
              <TabsTrigger
                value="entities"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Users className="h-4 w-4 hidden md:block" />
                <span>Entities</span>
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <ListChecks className="h-4 w-4 hidden md:block" />
                <span>Milestones</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <BarChart3 className="h-4 w-4 hidden md:block" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Building className="h-4 w-4 hidden md:block" />
                <span>Related</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <TabsContent value="general" className="mt-4 h-full">
                <GeneralInformation
                  selectedEscrow={selectedEscrow}
                  userRolesInEscrow={userRolesInEscrow}
                  dialogStates={dialogStates}
                  areAllMilestonesApproved={areAllMilestonesApproved}
                  onViewProgress={() => setActiveTab("progress")}
                />
              </TabsContent>

              <TabsContent value="entities" className="mt-4 h-full">
                <Entities selectedEscrow={selectedEscrow} />
              </TabsContent>

              <TabsContent value="milestones" className="mt-4 h-full">
                <Card className="p-4 h-full">
                  <Milestones
                    selectedEscrow={selectedEscrow}
                    userRolesInEscrow={userRolesInEscrow}
                    setEvidenceVisibleMap={setEvidenceVisibleMap}
                    evidenceVisibleMap={evidenceVisibleMap}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-4 h-full">
                <Card className="p-6 h-full">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Milestone Progress</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Approved Progress</h4>
                        <EscrowMilestoneProgressBar
                          escrow={selectedEscrow!}
                          mode="approved"
                          showHeader={true}
                          showText={true}
                        />
                      </div>
                      {selectedEscrow?.type === "multi-release" && (
                        <div>
                          <h4 className="font-medium mb-2">Released Progress</h4>
                          <EscrowMilestoneProgressBar
                            escrow={selectedEscrow!}
                            mode="released"
                            showHeader={true}
                            showText={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="related" className="mt-4 h-full">
                <Card className="p-4 h-full">
                  <RelatedEscrows selectedEscrow={selectedEscrow!} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {dialogStates.successRelease.isOpen && (
        <SuccessReleaseDialog
          isOpen={dialogStates.successRelease.isOpen}
          onOpenChange={dialogStates.successRelease.setIsOpen}
        />
      )}
    </>
  );
};
