'use client'

import React, { useState } from 'react'
import {
  Button,
  Input,
  Card,
  DashboardCard,
  Modal,
  Table,
  Toast,
  Dropdown,
  Pagination,
  ProgressBar,
  SearchField,
  Upload,
} from '@/components/ui'

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [dropdownValue, setDropdownValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            RAPEX UI Component Library
          </h1>
          <p className="text-gray-600">
            Modern, minimalist components with purple-orange gradient theme
          </p>
        </div>
        
        <div className="space-y-12">
          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            <Card>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </Card>
          </section>
          
          {/* Inputs */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Inputs</h2>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Text Input" placeholder="Enter text" />
                <Input label="Email" type="email" placeholder="your@email.com" />
                <Input label="Password" type="password" placeholder="••••••••" />
                <Input label="With Error" error="This field is required" />
              </div>
            </Card>
          </section>
          
          {/* Dashboard Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Dashboard Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard
                title="Total Revenue"
                value="$45,231"
                trend={{ value: 12, isPositive: true }}
                subtitle="vs last month"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <DashboardCard
                title="New Orders"
                value="156"
                trend={{ value: 8, isPositive: true }}
                subtitle="vs last week"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
              <DashboardCard
                title="Active Users"
                value="2,345"
                trend={{ value: 3, isPositive: false }}
                subtitle="vs yesterday"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
            </div>
          </section>
          
          {/* Search & Dropdown */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Search & Dropdown</h2>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchField
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search products..."
                />
                <Dropdown
                  label="Select Role"
                  options={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'Merchant', value: 'merchant' },
                    { label: 'Rider', value: 'rider' },
                    { label: 'User', value: 'user' },
                  ]}
                  value={dropdownValue}
                  onChange={setDropdownValue}
                  placeholder="Choose role..."
                />
              </div>
            </Card>
          </section>
          
          {/* Progress Bar */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Progress Bar</h2>
            <Card>
              <div className="space-y-4">
                <ProgressBar value={75} label="Project Progress" />
                <ProgressBar value={50} color="green" />
                <ProgressBar value={30} color="red" size="lg" />
              </div>
            </Card>
          </section>
          
          {/* Table */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Table</h2>
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'status', label: 'Status' },
              ]}
              data={[
                { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
                { name: 'Jane Smith', email: 'jane@example.com', role: 'Merchant', status: 'Active' },
                { name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
              ]}
              onRowClick={(row) => console.log('Clicked:', row)}
            />
          </section>
          
          {/* Pagination */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Pagination</h2>
            <Card>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </Card>
          </section>
          
          {/* Modal & Toast */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Modal & Toast</h2>
            <Card>
              <div className="flex gap-4">
                <Button onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
                <Button onClick={() => setShowToast(true)} variant="secondary">
                  Show Toast
                </Button>
              </div>
            </Card>
          </section>
          
          {/* Upload */}
          <section>
            <h2 className="text-2xl font-bold mb-6">File Upload</h2>
            <Card>
              <Upload
                onFileSelect={(files) => console.log('Files:', files)}
                accept="image/*"
                multiple
              />
            </Card>
          </section>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>RAPEX UI Component Library • Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <p>This is a beautiful modal component with purple-orange gradient theme!</p>
      </Modal>
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message="Action completed successfully!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
    </div>
  )
}
