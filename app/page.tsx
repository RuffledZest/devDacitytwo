"use client"

import type React from "react"

import { useState } from "react"
import { Github, Upload, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deployToArweave } from "@/lib/deploy"
import { processGithubRepo } from "@/lib/process-github"
import { processZipFile } from "@/lib/process-zip"

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deployedUrls, setDeployedUrls] = useState<string[]>([])
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleGithubDeploy = async () => {
    if (!githubUrl) {
      setError("Please enter a GitHub repository URL")
      return
    }

    setIsLoading(true)
    setError(null)
    setDeployedUrls([])

    try {
      const html = await processGithubRepo(githubUrl)
      const size = new Blob([html]).size / 1024 // Size in KB
      setFileSize(size)

      if (size > 100) {
        setError(`HTML file size (${size.toFixed(2)}KB) exceeds 100KB limit. Please use a smaller project.`)
        setIsLoading(false)
        return
      }

      const result = await deployToArweave(html)
      if (result.success) {
        setDeployedUrls(result.links)
      } else {
        setError("Deployment failed. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setError(null)
    }
  }

  const handleZipDeploy = async () => {
    if (!selectedFile) {
      setError("Please select a zip file")
      return
    }

    setIsLoading(true)
    setError(null)
    setDeployedUrls([])

    try {
      const html = await processZipFile(selectedFile)
      const size = new Blob([html]).size / 1024 // Size in KB
      setFileSize(size)

      if (size > 100) {
        setError(`HTML file size (${size.toFixed(2)}KB) exceeds 100KB limit. Please use a smaller project.`)
        setIsLoading(false)
        return
      }

      const result = await deployToArweave(html)
      if (result.success) {
        setDeployedUrls(result.links)
      } else {
        setError("Deployment failed. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleHtmlDeploy = async () => {
    if (!selectedFile) {
      setError("Please select an HTML or zip file")
      return
    }

    setIsLoading(true)
    setError(null)
    setDeployedUrls([])

    try {
      let html: string

      if (selectedFile.name.endsWith(".html") || selectedFile.name.endsWith(".htm")) {
        // Direct HTML file
        html = await selectedFile.text()
      } else if (selectedFile.name.endsWith(".zip")) {
        // Zip file containing HTML and assets
        html = await processZipFile(selectedFile)
      } else {
        throw new Error("Please upload an HTML file or a zip file")
      }

      const size = new Blob([html]).size / 1024 // Size in KB
      setFileSize(size)

      if (size > 100) {
        setError(`HTML file size (${size.toFixed(2)}KB) exceeds 100KB limit. Please use a smaller project.`)
        setIsLoading(false)
        return
      }

      const result = await deployToArweave(html)
      if (result.success) {
        setDeployedUrls(result.links)
      } else {
        setError("Deployment failed. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Arweave Deployer X</h1>
        <p className="text-gray-500 max-w-xl">
          Deploy your static websites to the Arweave blockchain. Upload from GitHub or a zip file.
        </p>
      </div>

      <Tabs defaultValue="github" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="github">GitHub Repository</TabsTrigger>
          <TabsTrigger value="zip">Upload Zip</TabsTrigger>
          <TabsTrigger value="html">HTML File</TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>Deploy from GitHub</CardTitle>
              <CardDescription>Enter the URL of your GitHub repository to deploy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://github.com/username/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button onClick={handleGithubDeploy} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Github className="mr-2 h-4 w-4" />
                        Deploy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zip">
          <Card>
            <CardHeader>
              <CardTitle>Deploy from Zip</CardTitle>
              <CardDescription>Upload a zip file containing your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input type="file" accept=".zip" onChange={handleFileChange} disabled={isLoading} />
                  <Button onClick={handleZipDeploy} disabled={isLoading || !selectedFile}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Deploy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle>Deploy HTML File</CardTitle>
              <CardDescription>Upload a single HTML file or a zip containing HTML, CSS, and JS files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input type="file" accept=".html,.htm,.zip" onChange={handleFileChange} disabled={isLoading} />
                  <Button onClick={handleHtmlDeploy} disabled={isLoading || !selectedFile}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Deploy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fileSize !== null && !error && (
        <Alert className="mt-6">
          <AlertDescription>
            HTML file size: {fileSize.toFixed(2)}KB {fileSize > 90 && "(approaching 100KB limit)"}
          </AlertDescription>
        </Alert>
      )}

      {deployedUrls.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Deployment Successful!</CardTitle>
            <CardDescription>Your site has been deployed to Arweave</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {deployedUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <span className="text-sm truncate max-w-[80%]">{url}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
