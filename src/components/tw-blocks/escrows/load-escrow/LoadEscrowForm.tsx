"use client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoadEscrow } from "./useLoadEscrow";
import { Loader2, Search } from "lucide-react";

export interface LoadEscrowFormProps {
  onSuccess?: () => void;
}

export const LoadEscrowForm = ({ onSuccess }: LoadEscrowFormProps) => {
  const { form, handleSubmit, isSubmitting } = useLoadEscrow({ onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
        <FormField
          control={form.control}
          name="contractId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escrow Contract ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Load Escrow
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
