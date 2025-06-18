"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FaGithub, FaGoogle } from "react-icons/fa";
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

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = React.useState<"login" | "signup">("login")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [displayName, setDisplayName] = React.useState("")
  const [username, setUsername] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // For now, just simulate successful login/signup
    console.log(mode, { email, password, displayName, username })
    
    // Call success callback
    onLoginSuccess?.()
    
    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setDisplayName("")
    setUsername("")
  }

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-[24px] py-[32px] w-[450px]">
        <DialogHeader className="grid gap-[4px]">
            <DialogTitle className="font-semibold">
                {mode === "login" ? "Login to MedTech Mesh" : "Create Account"}
            </DialogTitle>
            <DialogDescription>
                {mode === "login" 
                  ? "Please enter your account" 
                  : "Please fill in your information to create an account"
                }
            </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-[14px]">
                {mode === "signup" && (
                  <>
                    <div className="grid gap-[4px] text-[16px]">
                        <Label className="">
                            Display Name
                        </Label>
                        <Input
                            className="px-[18px] py-[12px] rounded-[4px]"
                            type="text"
                            placeholder="your display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-[4px] text-[16px]">
                        <Label className="">
                            Username
                        </Label>
                        <Input
                            className="px-[18px] py-[12px] rounded-[4px]"
                            type="text"
                            placeholder="your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                  </>
                )}
                <div className="grid gap-[4px] text-[16px]">
                    <Label className="">
                        Email
                    </Label>
                    <Input
                        className="px-[18px] py-[12px] rounded-[4px]"
                        type="email"
                        placeholder="your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="grid gap-[4px] text-[16px]">
                    <Label className="">
                        Password
                    </Label>
                    <Input
                        className="px-[18px] py-[12px] rounded-[4px]"
                        type="password"
                        placeholder="your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {mode === "signup" && (
                  <div className="grid gap-[4px] text-[16px]">
                      <Label className="">
                          Confirm Password
                      </Label>
                      <Input
                          className="px-[18px] py-[12px] rounded-[4px]"
                          type="password"
                          placeholder="confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                      />
                  </div>
                )}
            </div>
        </form>
        <DialogFooter>
            <div className="flex flex-col mt-[18px] gap-[12px] w-full items-center">
                <Button 
                  type="submit"
                  className="w-full py-[12px] text-white text-[16px] items-center justify-center cursor-pointer" 
                  onClick={handleSubmit}
                >
                    {mode === "login" ? "Login" : "Create Account"}
                </Button>
                <p className="text-textKedua text-[14px]">
                    {mode === "login" ? "OR LOGIN WITH" : "OR SIGN UP WITH"}
                </p>
                <div className="grid grid-cols-2 gap-[12px] w-full">
                    <Button 
                      className="w-full py-[12px] text-white text-[16px] items-center justify-center cursor-pointer"
                      onClick={() => onLoginSuccess?.()}
                    >
                        <FaGithub className="mr-[8px]" />
                        GitHub
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full py-[12px] text-[16px] items-center justify-center cursor-pointer"
                      onClick={() => onLoginSuccess?.()}
                    >
                        <FaGoogle className="mr-[8px]" />
                        Google
                    </Button>
                </div>
                <p className="text-textKedua text-[16px]">
                    {mode === "login" ? (
                      <>
                        New to MedTech Mesh? 
                        <span 
                            className="text-blue-500 cursor-pointer ml-[4px]" 
                            onClick={() => switchMode("signup")}
                        >
                            Create an account
                        </span>
                      </>
                    ) : (
                      <>
                        Already have an account?
                        <span 
                            className="text-blue-500 cursor-pointer ml-[4px]" 
                            onClick={() => switchMode("login")}
                        >
                            Sign in
                        </span>
                      </>
                    )}
                </p>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}