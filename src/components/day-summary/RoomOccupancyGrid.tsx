import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoomData } from '@/hooks/use-daily-summary-data';
import Skeleton from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/utils/formatters';

interface RoomOccupancyGridProps {
  isLoading: boolean;
  roomData: RoomData[];
}

const RoomOccupancyGrid: React.FC<RoomOccupancyGridProps> = ({
  isLoading,
  roomData
}) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleRoomClick = (room: RoomData) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };
  
  // Group rooms by floor
  const roomsByFloor = roomData.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, RoomData[]>);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Room Occupancy</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
                  Occupied
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  <div className="mr-1 h-2 w-2 rounded-full bg-blue-500"></div>
                  Vacant
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.keys(roomsByFloor).sort((a, b) => Number(b) - Number(a)).map(floor => (
              <div key={floor} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Floor {floor}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {roomsByFloor[Number(floor)]
                    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                    .map(room => (
                      <Button
                        key={room.roomNumber}
                        variant="outline"
                        className={`h-16 flex flex-col items-center justify-center p-2 transition-all hover:scale-105 ${
                          room.isOccupied 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800/50' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800/50'
                        }`}
                        onClick={() => handleRoomClick(room)}
                      >
                        <span className="text-xs font-medium">{room.roomNumber}</span>
                        <span className="text-[10px] truncate max-w-full">
                          {room.isOccupied ? room.roomType : 'Vacant'}
                        </span>
                      </Button>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Room {selectedRoom?.roomNumber}
              <Badge className={selectedRoom?.isOccupied ? 'bg-green-500' : 'bg-blue-500'}>
                {selectedRoom?.isOccupied ? 'Occupied' : 'Vacant'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedRoom?.roomType} Room
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom?.isOccupied ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Guest</p>
                  <p className="font-medium">{selectedRoom.guestName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Room Rate</p>
                  <p className="font-medium">{formatCurrency(selectedRoom.roomRate || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Check-in</p>
                  <p className="font-medium">{selectedRoom.checkInDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Check-out</p>
                  <p className="font-medium">{selectedRoom.checkOutDate}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Room Revenue</p>
                  <p className="font-medium">{formatCurrency(selectedRoom.roomRate || 0)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-muted-foreground">Additional Spend</p>
                  <p className="font-medium">{formatCurrency(selectedRoom.additionalSpend || 0)}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <p className="font-medium">Total Revenue</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedRoom.totalSpend || 0)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              This room is currently vacant.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomOccupancyGrid;
