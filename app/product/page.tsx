'use client'

import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/lib/store'
import { updateModelLikes, updateModelDownloads } from '@/lib/features/models/modelsSlice'
import { BiLike } from 'react-icons/bi';
import { MdOutlineFileDownload } from 'react-icons/md';
import { IoMdShareAlt } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { LuHistory, LuTag } from "react-icons/lu";
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { useRouter, useSearchParams } from 'next/navigation';
import { PreviewSelector } from '@/components/3d/preview-selector';
import { MdClear } from "react-icons/md";

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get current model from Redux state
  const { currentModel } = useSelector((state: RootState) => state.models);
  const modelId = searchParams.get('id');

  // If no model in state, you might want to fetch by ID
  const product = currentModel || {
    id: modelId || '1',
    title: 'Nama Produk',
    author: 'Creator Name',
    username: '@username',
    category: '3D Model',
    likes: 100,
    downloads: 100,
    shares: 100,
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Praesentium aliquid quasi, omnis dolorem, accusamus itaque delectus sapiente, vero hic id corrupti eaque iste voluptate assumenda ipsam voluptates molestiae saepe quisquam? Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum unde maxime molestias. A cum similique voluptas soluta, nesciunt alias blanditiis!',
    license: 'CC Attribution',
    publishedDate: '7 Day Ago',
    tags: ['medical', '3d', 'anatomy'],
    images: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg'],
    // Add 3D model URLs (these would come from your database/API)
    modelUrl: '/models/sample-model.glb', // or .stl, .gltf
    previewImage: '/previews/model-preview.jpg',
    relatedModels: [
      { id: '1', title: 'Nama Produk', author: 'Author', downloads: 100, likes: 100, shares: 100 },
      { id: '2', title: 'Nama Produk', author: 'Author', downloads: 100, likes: 100, shares: 100 },
      { id: '3', title: 'Nama Produk', author: 'Author', downloads: 100, likes: 100, shares: 100 },
    ]
  };

  const handleClose = () => {
    router.back();
  };

  const handleLike = () => {
    dispatch(updateModelLikes({ 
      id: product.id, 
      likes: product.likes + 1 
    }));
  };

  const handleDownload = () => {
    dispatch(updateModelDownloads({ 
      id: product.id, 
      downloads: product.downloads + 1 
    }));
    
    // Handle actual download logic here
    console.log('Downloading model:', product.id);
  };

  const handleShare = () => {
    // Handle share logic
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this 3D model: ${product.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleRelatedModelClick = (relatedModel: any) => {
    router.push(`/product?id=${relatedModel.id}`);
  };

  return (
    <div className='bg-black/50 p-[50px] relative'>
        {/* close button */}
        <MdClear className='absolute top-[18px] right-[18px] text-white hover:bg-transparent hover:text-red-500 size-[28px]' onClick={handleClose} />
        <Card className='p-[50px] bg-white rounded-[12px]'>
            <CardContent>
                <div className="flex gap-[32px] overflow-hidden">
                    {/* div kiri - mengambil sisa ruang */}
                    <div className="flex-1">
                        <div className="h-[500px] relative rounded-[4px] overflow-hidden">
                          {/* Author info overlay */}
                          <div className='flex items-center gap-[12px] absolute left-[12px] top-[12px] z-10 p-3'>
                            <Avatar>
                              <AvatarFallback className='size-[50px]'>
                                {product.author?.slice(0, 2).toUpperCase() || 'CN'}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-col gap-[4px]'>
                              <p className='text-white font-bold text-[18px]'>{product.author}</p>
                              <p className='text-gray-200 font-medium text-[12px]'>{product.username || '@username'}</p>
                            </div>
                          </div>
                          
                          {/* 3D/Image Preview Component */}
                          <PreviewSelector
                            modelUrl={product.modelUrl}
                            imageUrl={product.previewImage}
                            images={product.images}
                            className="w-full h-full"
                          />
                        </div>
                        
                        <div className='gap-[4px]'>
                            <div className='mt-[12px] flex justify-between'>
                                <div>
                                    <p className='text-[24px] font-bold'>{product.title}</p>
                                    <p className='text-[20px] text-gray-600 mt-[2px]'>
                                        {product.category}
                                    </p>
                                </div>
                                <div className='flex'>
                                    <Button 
                                      className='text-[16px] text-gray-500 cursor-pointer hover:text-red-500' 
                                      variant='ghost'
                                      onClick={handleLike}
                                    >
                                        <BiLike className="size-[20px] mr-[2px]" />
                                        {product.likes} Likes
                                    </Button>
                                    <Button className='text-[16px] text-gray-500 cursor-pointer' variant='ghost'>
                                        <MdOutlineFileDownload className="size-[20px] mr-[2px]" />
                                        {product.downloads} Downloads
                                    </Button>
                                    <Button 
                                      className='text-[16px] text-gray-500 cursor-pointer' 
                                      variant='ghost'
                                      onClick={handleShare}
                                    >
                                        <IoMdShareAlt className="size-[20px] mr-[2px]" />
                                        {product.shares} Shares
                                    </Button>
                                </div>
                            </div>
                            <Button 
                              className='w-[190px] h-[61px] bg-blue-600 text-white font-bold text-[20px] rounded-[8px] mt-[24px] hover:bg-blue-700 transition-colors'
                              onClick={handleDownload}
                            >
                                Download
                            </Button>
                        </div>
                        <hr className='border-t border-gray-300 my-[14px]'/>
                        <div className='gap-[14px]'>
                            <h3 className='font-bold text-[24px]'>Description</h3>
                            {/* hasil inputan deskripsi oleh kreator */}
                            <p className='text-[16px] text-[#2E2E2E]'>{product.description}</p>
                        </div>
                        <div className='mt-[18px] flex flex-col gap-[4px]'>
                            <p className='text-[12px]'>
                                License: {product.license}
                            </p>
                            <p className='flex items-center gap-[4px] text-muted-foreground text-[14px]'>
                                <LuHistory className='size-[18px]'/>
                                Published {product.publishedDate}
                            </p>
                            {/* tag yang digunakan kreator */}
                            <div className='flex items-center gap-[8px]'>
                                <LuTag className='size-[18px]'/>
                                {product.tags?.map((tag, index) => (
                                  <Badge key={index} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* div kanan - lebar tetap 374px */}
                    <div className="flex flex-col gap-[24px] w-[374px] overflow-y-auto">
                      {/* image preview placeholder */}
                      <div className="flex flex-col gap-[12px]">
                        {product.images?.map((image, index) => (
                          <div key={index} className="w-full h-[200px] bg-gray-400 items-center justify-center flex rounded-[4px]">
                            image placeholder {index + 1}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-[14px]">
                        <p className="text-[16px] font-bold">RELATED MODELS</p>
                        
                        {product.relatedModels?.map((relatedModel, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-[10px] p-3 border rounded-[4px] cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleRelatedModelClick(relatedModel)}
                          >
                            <div className="w-[80px] h-[60px] bg-gray-400 rounded flex-shrink-0"></div>
                            <div className="flex flex-col gap-[4px] flex-1">
                              <p className="text-[16px] font-medium">{relatedModel.title}</p>
                              <p className="text-[14px] text-gray-600">{relatedModel.author}</p>
                              <div className="flex items-center gap-[12px] text-[12px] text-muted-foreground">
                                <div className="flex items-center gap-[4px]">
                                  <BiLike className="size-[12px]"/>
                                  {relatedModel.likes}
                                </div>
                                <div className="flex items-center gap-[4px]">
                                  <MdOutlineFileDownload className="size-[12px]"/>
                                  {relatedModel.downloads}
                                </div>
                                <div className="flex items-center gap-[4px]">
                                  <IoMdShareAlt className="size-[12px]"/>
                                  {relatedModel.shares}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
