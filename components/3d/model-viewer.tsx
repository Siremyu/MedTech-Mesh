'use client'

import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, useProgress } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import * as THREE from 'three'

interface ModelViewerProps {
  modelUrl?: string
  imageUrl?: string
  className?: string
}

// Loading component
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <div>{Math.round(progress)}% loaded</div>
      </div>
    </Html>
  )
}

// STL Model Component
function STLModel({ url }: { url: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useLoader(STLLoader, url)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  React.useEffect(() => {
    if (geometry) {
      geometry.computeBoundingBox()
      const box = geometry.boundingBox!
      const center = box.getCenter(new THREE.Vector3())
      geometry.translate(-center.x, -center.y, -center.z)
      
      // Normalize size
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3 / maxDim
      geometry.scale(scale, scale, scale)
    }
  }, [geometry])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#8cc8ff" />
    </mesh>
  )
}

// GLTF/GLB Model Component
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const modelRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
    }
  })

  React.useEffect(() => {
    if (scene) {
      // Normalize size and center
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      scene.position.set(-center.x, -center.y, -center.z)
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3 / maxDim
      scene.scale.setScalar(scale)
    }
  }, [scene])

  return <primitive ref={modelRef} object={scene} />
}

// Main 3D Scene Component
function Scene({ modelUrl }: { modelUrl: string }) {
  const fileExtension = modelUrl.split('.').pop()?.toLowerCase()

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      {fileExtension === 'stl' && <STLModel url={modelUrl} />}
      {(fileExtension === 'gltf' || fileExtension === 'glb') && <GLTFModel url={modelUrl} />}
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={false}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
      />
    </>
  )
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('3D Model loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Main Model Viewer Component
export function ModelViewer({ modelUrl, imageUrl, className }: ModelViewerProps) {
  const [modelError, setModelError] = useState(false)
  
  // Show image preview if no model URL or if model failed to load
  if (!modelUrl || modelError) {
    return (
      <div className={`relative ${className}`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Model Preview" 
            className="w-full h-full object-cover rounded-[4px]"
            onError={() => {
              // If image also fails, show placeholder
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-400 rounded-[4px] flex items-center justify-center">
            <span className="text-white text-xl">No Preview Available</span>
          </div>
        )}
        
        {/* Overlay info */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          Image Preview
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary 
        fallback={
          <div className="w-full h-full bg-gray-400 rounded-[4px] flex items-center justify-center">
            <span className="text-white text-xl">Failed to load 3D model</span>
          </div>
        }
      >
        <Canvas 
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          onError={() => setModelError(true)}
        >
          <Suspense fallback={<Loader />}>
            <Scene modelUrl={modelUrl} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* Overlay controls info */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        3D Preview • Click & drag to rotate
      </div>
    </div>
  )
}