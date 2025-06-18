"use client"

import * as React from "react"
import { FaRegTrashCan } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteAccountCard() {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showAlert, setShowAlert] = React.useState(false)

  const handleDeleteAccount = () => {
    // Handle account deletion logic here
    console.log("Delete account")
    setShowDeleteDialog(false)
    setShowAlert(true)

    // Hide alert after 3 seconds
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleCancel = () => {
    setShowDeleteDialog(false)
  }

  return (
    <>
      {showAlert && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Account deletion process has been initiated. You will receive a confirmation email shortly.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        className="w-full p-[24px] text-[16px] border-1 text-red-500 justify-start shadow-none cursor-pointer hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" 
        variant="outline" 
        onClick={() => setShowDeleteDialog(true)}
      >
        <FaRegTrashCan className="size-[16px] text-red-500" />
        Delete Account
      </Button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}