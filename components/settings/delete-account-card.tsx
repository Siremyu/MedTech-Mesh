"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/features/auth/authSlice"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function DeleteAccountCard() {
  const { data: session } = useSession()
  const dispatch = useDispatch()
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [confirmationText, setConfirmationText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm')
      return
    }

    try {
      setIsDeleting(true)
      
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success("Account deleted successfully")
        
        // Sign out and redirect
        await signOut({ redirect: false })
        dispatch(logout())
        router.push("/")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete account")
      }
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setConfirmationText("")
    }
  }

  const handleCancel = () => {
    setShowDeleteDialog(false)
    setConfirmationText("")
  }

  return (
    <>
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <Button 
              className="w-full p-[24px] text-[16px] border-1 text-red-500 justify-start shadow-none cursor-pointer hover:text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" 
              variant="outline" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <FaRegTrashCan className="size-[16px] text-red-500 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-900">Delete Account</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>This action cannot be undone. This will permanently:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Delete your account and profile</li>
                <li>Remove all your uploaded models</li>
                <li>Delete your likes and downloads history</li>
                <li>Remove you from all collections</li>
              </ul>
              <p className="font-medium pt-2">
                Type <span className="font-bold text-red-600">"DELETE"</span> to confirm:
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-red-200 focus:border-red-500"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== "DELETE"}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}