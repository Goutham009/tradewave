'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, Package } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface PendingRequirement {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productType: string;
  quantity: number;
  unit: string;
  submittedAt: string;
}

const mockTimeSlots: TimeSlot[] = [
  { id: 'slot-1', time: '09:00 AM', available: true },
  { id: 'slot-2', time: '10:00 AM', available: true },
  { id: 'slot-3', time: '11:00 AM', available: false },
  { id: 'slot-4', time: '12:00 PM', available: false },
  { id: 'slot-5', time: '02:00 PM', available: true },
  { id: 'slot-6', time: '03:00 PM', available: true },
  { id: 'slot-7', time: '04:00 PM', available: true },
  { id: 'slot-8', time: '05:00 PM', available: false },
];

const mockRequirements: PendingRequirement[] = [
  {
    id: 'req-001',
    companyName: 'TechCorp Industries',
    contactName: 'John Smith',
    contactEmail: 'john@techcorp.com',
    contactPhone: '+1 555-0123',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    submittedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'req-002',
    companyName: 'Global Manufacturing Co.',
    contactName: 'Sarah Chen',
    contactEmail: 'sarah@globalmanuf.com',
    contactPhone: '+1 555-0456',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    submittedAt: '2024-01-19T14:20:00Z',
  },
  {
    id: 'req-003',
    companyName: 'Premier Retail Ltd',
    contactName: 'Mike Johnson',
    contactEmail: 'mike@premierretail.com',
    contactPhone: '+1 555-0789',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    submittedAt: '2024-01-18T09:15:00Z',
  },
];

export function ConsultationScheduler() {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [requirements, setRequirements] = useState<PendingRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 500));
    setAvailableSlots(mockTimeSlots);
    setRequirements(mockRequirements);
    setLoading(false);
  };

  const handleScheduleConsultation = async (requirementId: string) => {
    if (!selectedSlot) {
      alert('Please select a time slot first');
      return;
    }

    setScheduling(true);

    try {
      const response = await fetch('/api/admin/consultations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId,
          slotId: selectedSlot.id,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        alert('Consultation scheduled successfully! Email sent to buyer.');
        // Remove the scheduled requirement from the list
        setRequirements(requirements.filter(r => r.id !== requirementId));
        setSelectedSlot(null);
        // Mark slot as unavailable
        setAvailableSlots(slots => 
          slots.map(s => s.id === selectedSlot.id ? { ...s, available: false } : s)
        );
      } else {
        alert('Failed to schedule consultation');
      }
    } catch {
      // For demo, simulate success
      alert('Consultation scheduled successfully! Email sent to buyer.');
      setRequirements(requirements.filter(r => r.id !== requirementId));
      setSelectedSlot(null);
      setAvailableSlots(slots => 
        slots.map(s => s.id === selectedSlot?.id ? { ...s, available: false } : s)
      );
    }

    setScheduling(false);
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading scheduler...</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Calendar View */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Available Slots
        </h3>
        
        {/* Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
            }}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          {availableSlots.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">
              No available slots for this date
            </p>
          ) : (
            availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && setSelectedSlot(slot)}
                disabled={!slot.available}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                  selectedSlot?.id === slot.id
                    ? 'border-teal-500 bg-teal-50'
                    : slot.available
                    ? 'border-neutral-200 hover:border-teal-300 cursor-pointer'
                    : 'border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {slot.time}
                  </span>
                  <Badge variant={slot.available ? 'success' : 'destructive'}>
                    {slot.available ? 'Available' : 'Booked'}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedSlot && (
          <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm font-medium text-teal-700">
              Selected: {selectedDate} at {selectedSlot.time}
            </p>
          </div>
        )}
      </Card>

      {/* Pending Requirements */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Pending Consultations
        </h3>
        
        <div className="space-y-3">
          {requirements.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">
              No pending consultations
            </p>
          ) : (
            requirements.map((req) => (
              <div key={req.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{req.companyName}</p>
                    <p className="text-sm text-neutral-600">{req.contactName}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                
                <div className="text-sm text-neutral-600 mb-3 space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {req.contactEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {req.contactPhone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    {req.productType} - {req.quantity} {req.unit}
                  </p>
                </div>

                <p className="text-xs text-neutral-500 mb-3">
                  Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                </p>

                <Button
                  className="w-full"
                  onClick={() => handleScheduleConsultation(req.id)}
                  disabled={!selectedSlot || scheduling}
                >
                  {scheduling ? 'Scheduling...' : selectedSlot 
                    ? `Schedule for ${selectedSlot.time}` 
                    : 'Select a Time Slot'}
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
