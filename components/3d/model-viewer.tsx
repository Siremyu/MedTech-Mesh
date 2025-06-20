'use client'

import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, useProgress } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import * as THREE from 'three'

interface ModelViewerProps {
  modelUrl: string
  className?: string
}

// Enhanced Loading component with debug info
function Loader() {
  const { progress, loaded, total } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center text-white bg-black/50 p-4 rounded">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
        <div className="text-sm">{Math.round(progress)}% loaded</div>
        <div className="text-xs opacity-75">{loaded} / {total} items</div>
      </div>
    </Html>
  )
}

// Test Cube Component for debugging
function TestCube() {
  const mesh = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.5
      mesh.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

// Enhanced STL Model Component with error handling
function STLModel({ url }: { url: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 Loading STL from:', url)
    
    const loader = new STLLoader()
    
    loader.load(
      url,
      (loadedGeometry) => {
        console.log('✅ STL loaded successfully', loadedGeometry)
        
        // Process geometry
        loadedGeometry.computeVertexNormals()
        loadedGeometry.center()
        
        // Scale to fit
        const box = new THREE.Box3().setFromObject(new THREE.Mesh(loadedGeometry))
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        loadedGeometry.scale(scale, scale, scale)
        
        setGeometry(loadedGeometry)
        setLoadError(null)
      },
      (progress) => {
        console.log('📊 STL loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('❌ STL loading error:', error)
        setLoadError(`Failed to load STL: ${error.message || 'Unknown error'}`)
      }
    )
  }, [url])
  
  // Auto-rotate
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.3
    }
  })

  if (loadError) {
    return (
      <Html center>
        <div className="text-red-500 bg-white p-2 rounded text-sm max-w-xs text-center">
          {loadError}
        </div>
      </Html>
    )
  }

  if (!geometry) {
    return null
  }

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshPhongMaterial 
        color="#4a90e2" 
        shininess={100}
        transparent={false}
      />
    </mesh>
  )
}

// Enhanced GLTF/GLB Model Component
function GLTFModel({ url }: { url: string }) {
  const mesh = useRef<THREE.Group>(null)
  const [model, setModel] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 Loading GLTF/GLB from:', url)
    
    // Use dynamic import to avoid SSR issues
    import('@react-three/drei').then(({ useGLTF }) => {
      try {
        const gltf = useGLTF.preload(url)
        setModel(gltf)
        console.log('✅ GLTF/GLB loaded successfully', gltf)
      } catch (error: any) {
        console.error('❌ GLTF/GLB loading error:', error)
        setLoadError(`Failed to load GLTF/GLB: ${error.message || 'Unknown error'}`)
      }
    })
  }, [url])
  
  // Auto-rotate
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.3
    }
  })

  if (loadError) {
    return (
      <Html center>
        <div className="text-red-500 bg-white p-2 rounded text-sm max-w-xs text-center">
          {loadError}
        </div>
      </Html>
    )
  }

  if (!model?.scene) {
    return null
  }

  // Process the model
  React.useEffect(() => {
    if (model?.scene) {
      const box = new THREE.Box3().setFromObject(model.scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      model.scene.position.sub(center)
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      model.scene.scale.setScalar(scale)
    }
  }, [model])

  return <primitive ref={mesh} object={model.scene} />
}

// Main 3D Scene Component
function Scene({ modelUrl }: { modelUrl: string }) {
  const [showTestCube, setShowTestCube] = useState(false)

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || ''
  }

  const extension = getFileExtension(modelUrl)
  
  // Show test cube if no valid model URL
  useEffect(() => {
    if (!modelUrl || modelUrl.trim() === '') {
      setShowTestCube(true)
    }
  }, [modelUrl])

  console.log('🎯 Scene rendering with:', { modelUrl, extension, showTestCube })
  
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.8} />
      
      {/* Model or Test Cube */}
      <Suspense fallback={<Loader />}>
        {showTestCube ? (
          <TestCube />
        ) : extension === 'stl' ? (
          <STLModel url={modelUrl} />
        ) : ['gltf', 'glb'].includes(extension) ? (
          <GLTFModel url={modelUrl} />
        ) : (
          <STLModel url={modelUrl} />
        )}
      </Suspense>
      
      {/* Enhanced Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        maxDistance={15}
        minDistance={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  )
}

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('🚨 3D Model Viewer Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Main Model Viewer Component
export function ModelViewer({ modelUrl, className }: ModelViewerProps) {
  const [loadError, setLoadError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true)
    console.log('🎬 ModelViewer mounted with URL:', modelUrl)
  }, [])

  const ErrorFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-sm font-medium mb-2">3D Model Loading Failed</p>
        <p className="text-xs text-gray-400 mb-4">
          Model URL: {modelUrl || 'No URL provided'}
        </p>
        <p className="text-xs text-gray-400">
          Supported formats: STL, GLTF, GLB
        </p>
      </div>
    </div>
  )

  // Don't render on server-side
  if (!isClient) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-gray-500 text-sm">Loading 3D viewer...</div>
      </div>
    )
  }

  if (!modelUrl || loadError) {
    return <ErrorFallback />
  }

  return (
    <div className={`${className}`}>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Canvas
          camera={{ position: [4, 4, 4], fov: 50 }}
          style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
            borderRadius: '4px'
          }}
          onError={() => {
            console.error('❌ Canvas error occurred')
            setLoadError(true)
          }}
          gl={{ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
          }}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}