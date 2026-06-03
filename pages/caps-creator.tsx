import Image from 'next/image';
import React, { useState, useRef, ChangeEvent, DragEvent, CSSProperties } from 'react';
import { IconPencilPlus, IconPhotoDown, IconTextSize } from "@tabler/icons-react";
import { Checkbox, ColorInput, Select } from '@mantine/core';
import Header from '@/components/main/header/Index';
import Footer from '@/components/main/footer/Footer';
import Draggable from 'react-draggable';
import Head from 'next/head';


interface TextField {
  id: number;
  text: string;
  position: {
    x: number;
    y: number;
  };
  fontSize: number;
  color: any;
  background: any;
}

export default function CapsCreator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textFields, setTextFields] = useState<TextField[]>([]);
  const [selectedFontSize, setSelectedFontSize] = useState<number>(14);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [selectedBGColor, setSelectedBGColor] = useState<string>('Seçiniz');
  const [selectedBGColorCheck, setSelectedBGColorCheck] = useState<boolean>(false);
  const dropAreaRef = useRef<any>(null);
  let domtoimage = require('dom-to-image');

  const handleImageUpload = (file: File) => {
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddTextField = () => {
    const newTextField: TextField = {
      id: Date.now(),
      text: '',
      position: { x: 10, y: 10 },
      fontSize: selectedFontSize,
      color: selectedColor,
      background: selectedBGColorCheck && selectedBGColor
    };
    setTextFields([...textFields, newTextField]);
  };

  const handleBGColorCheckChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectedBGColorCheck(checked);
  };

  const handleDownload = () => {
    const imageContainer: any = document.querySelector('.image-container');
    if (imageContainer) {
      const textFieldsContainer = imageContainer.querySelector('.text-fields-container');
      if (textFieldsContainer) {
        textFieldsContainer.style.overflow = 'hidden';
      }

      const closeButtons = imageContainer.querySelectorAll('.close-button');
      closeButtons.forEach((button: any) => {
        button.style.display = 'none';
      });

      domtoimage.toJpeg(imageContainer, { quality: 0.95 })
        .then(function (dataUrl: any) {
          const link = document.createElement('a');
          link.download = 'image.jpg';
          link.href = dataUrl
          link.target = '_blank';
          link.style.position = 'fixed';
          link.style.top = '0';
          link.style.left = '0';
          link.style.zIndex = '9999';
          link.style.height = '0';
          link.style.overflow = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (textFieldsContainer) {
            textFieldsContainer.style.overflow = 'visible';
          }
          closeButtons.forEach((button: any) => {
            button.style.display = 'block';
          });
        });
    }
  };

  return (
    <>
        <Head>
        <title>Caps Oluştur / Pikcir</title>
        <meta id="meta-description" name="description" content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!" />
      </Head>
      <Header />
      <main className="h-auto app-main-with-tab-bar">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <div className='col-span-12'>
              <div
                ref={dropAreaRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}>
                {selectedImage ? (
                  <div className="relative flex flex-col lg:flex-row gap-5 lg:gap-10">
                    <div className='image-container relative overflow-hidden pt-5 lg:pt-0 w-full'>
                      <Image width={100} height={100} src={selectedImage} alt="Uploaded" className="pointer-events-none !w-auto !h-auto max-w-full lg:max-w-[600px]" />
                      {textFields.map((field) => {
                        const textFieldStyle: CSSProperties = {
                          left: field.position.x,
                          top: field.position.y,
                          position: 'absolute',
                          fontSize: `${field.fontSize}px`,
                          color: field.color,
                          background: field.background,
                          minWidth: 50,
                          minHeight: 40,
                          zIndex: 100
                        };
                        return (
                          <>
                            <Draggable>
                              <div key={field.id}
                                style={textFieldStyle}
                                className=' flex justify-center items-center rounded  relative z-5 cursor-pointer min-w-[50px] min-h-[40px]'>
                                <input className='outline-none font-bold text-center !p-0 !m-0 !leading-0 relative z-5 bg-transparent w-full' defaultValue={'Metin Gir'} />
                             
                                <button
                                  className="close-button absolute -top-4 -right-4 text-sm bg-58b4d1 text-white rounded-full !leading-none w-5 h-5"
                                  onClick={() => {
                                    const updatedFields = textFields.filter((item) => item.id !== field.id);
                                    setTextFields(updatedFields);
                                  }}>
                                  x
                                </button>
                              </div>
                            </Draggable>
                          </>
                        );
                      })}
                    </div>
                    <div className='flex flex-col gap-2 lg:pt-4 pb-8 lg:pb-0'>
                      <div>
                        <Select
                          icon={<IconTextSize size={15} />}
                          label="Font Büyüklüğü"
                          value={selectedFontSize.toString()}
                          onChange={(event: string) => {
                            const fontSize = parseInt(event);
                            setSelectedFontSize(fontSize);
                          }}
                          data={[
                            { value: "10", label: '10px' },
                            { value: "12", label: '12px' },
                            { value: "14", label: '14px' },
                            { value: "16", label: '16px' },
                            { value: "18", label: '18px' },
                            { value: "20", label: '20px' },
                            { value: "24", label: '24px' },
                            { value: "28", label: '28px' },
                            { value: "32", label: '32px' },
                            { value: "36", label: '36px' },
                            { value: "40", label: '40px' },
                            { value: "44", label: '44px' },
                            { value: "48", label: '48px' },
                          ]}
                        />
                      </div>
                      <div>
                        <ColorInput placeholder="Renk Seçiniz" label="Yazı Rengi"
                          value={selectedColor}
                          onChange={(event: string) => {
                            const color = event;
                            setSelectedColor(color);
                          }}
                          defaultValue={"#FFFFFF"}
                        />
                      </div>
                      <div className='mt-2'>
                        <Checkbox
                          label="Yazıya Arka Plan Rengi Ekle"
                          checked={selectedBGColorCheck}
                          onChange={handleBGColorCheckChange}
                        />
                      </div>
                      {selectedBGColorCheck &&
                        <div>
                          <ColorInput placeholder="Renk Seçiniz" label="Arka Plan Rengi"
                            value={selectedBGColor}
                            onChange={(event: string) => {
                              if (selectedBGColorCheck) {
                                const color = event;
                                setSelectedBGColor(color);
                              }
                              else {
                                setSelectedBGColor('');
                              }
                            }}
                            defaultValue={"#FFFFFF"}
                          />
                        </div>
                      }
                      <label htmlFor="">
                        <button className='text-58b4d1 border border-58b4d1 border-dashed rounded font-bold p-3 w-full mt-2 flex gap-4 items-center justify-center' onClick={handleAddTextField}>
                          <IconPencilPlus />
                          Yazı Alanı Ekle
                        </button>
                      </label>
                      <button className='rounded bg-003049 text-white font-bold p-3 w-full mt-2 flex gap-4 items-center justify-center' onClick={handleDownload}>
                        <IconPhotoDown />
                        Resmi İndir
                      </button>
                      <div className='flex flex-col gap-4 text-xs text-343a40 pb-10 mt-3'>
                        <div>
                          Yazı tipinizi ayarlayarak <strong>&apos;Yazı Alanı Ekle&apos;</strong> butonuna basınız.
                        </div>
                        <div>
                          Yazıyı resim üzerinde kaydırarak konumlandırabilirsiniz.
                        </div>
                        <div>
                          Görsel üstünde sınırsız Yazı Alanı oluşturabilirsiniz.
                        </div>
                        <div>
                          <strong>&apos;Resmi İndir&apos;</strong> diyerek paylaşıma hazır resminizi indirebilirsiniz.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex flex-col lg:flex-row gap-4 w-full justify-center items-center'>
                      <div className='w-full lg:w-[400px] h-[700px] rounded border border-58b4d1 border-dashed flex justify-center items-center m-4 relative cursor-pointer'>
                        <input
                          type="file"
                          onChange={handleFileInputChange}
                          className='absolute w-full h-full top-0 left-0 opacity-0'
                          ref={dropAreaRef}
                        />
                        <div className='text-sm text-58b4d1 font-bold mx-auto flex text-center w-full justify-center items-center'>Tıklayarak veya sürükleyerek resim yükleyebilirsiniz.</div>
                      </div>
                      <div className='flex flex-col gap-4 text-base text-343a40 pb-10'>
                        <div>
                          Resminizi sürükleyerek ya da tıklayarak açınız,
                        </div>
                        <div>
                          Yazı tipinizi ayarlayarak <strong>&apos;Yazı Alanı Ekle&apos;</strong> butonuna basınız.
                        </div>
                        <div>
                          Yazıyı resim üzerinde kaydırarak konumlandırabilirsiniz.
                        </div>
                        <div>
                          Görsel üstünde sınırsız Yazı Alanı oluşturabilirsiniz.
                        </div>
                        <div>
                          <strong>&apos;Resmi İndir&apos;</strong> diyerek paylaşıma hazır resminizi indirebilirsiniz.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>

  );
}
