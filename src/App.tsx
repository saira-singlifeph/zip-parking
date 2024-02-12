import { Button, Space, Table, Modal, Select } from 'antd';
import type { TableProps } from 'antd';
import './App.css';
import { useEffect, useState } from 'react';
import { apiService } from './services/api.service'


interface ParkingDetailsTableFormat {
  key: string;
  referenceNo: string;
  isPaid: string;
  amountToPay: number;
  paymentType: string;
  parkingLeve: number;
  vehicleType: string;
  startTime: string;
  data: ParkingDetails;
}

interface ParkingDetails {
  _id: string;
  parkingReferenceNo: string;
  parkingLevel: string;
  isPaid: boolean;
  amountToPay: number;
  paymentReferenceNo?: string;
  paymentType: string;
  startTime: string;
  vehicleType: string;
}

interface APIResponse {
  status: number;
  data: ParkingDetails[];
}

interface GeneratedInvoice {
  vehicleDescription: string;
  paymentMode: string;
  amountToPay: number;
  referenceNo: number;
  parkedHours: number;
}

const App = () => {

const [listOfParkingDetails, setlistOfParkingDetails] = useState<ParkingDetailsTableFormat[]>([]);
const [isCreatingNewParking, setIsCreatingNewParking] = useState(false);
const [openNewParkingModal, setOpenNewParkingModal] = useState(false);
const [selectedVehicleType, setSelectedVehicleType] = useState<null|string>(null);
const [generatedInvoice, setGeneratedInvoice] = useState<null|GeneratedInvoice>(null)

const fetchParkingDetails = async (): Promise<void> => {
  const response = await apiService({ endpoint: '/details', method: 'GET' }) as APIResponse;
  if (response.data.length > 0) {
    const { data } = response;
    const tableData = data.map((value) => {
      return {
        key: value._id,
        referenceNo: value.parkingReferenceNo,
        isPaid: `${value.isPaid}`,
        amountToPay: `${value.amountToPay}`,
        paymentType: value.paymentType,
        startTime: value.startTime,
        vehicleType: value.vehicleType,
        parkingLevel: value.parkingLevel,
        data: value,
      }
    }) as unknown as ParkingDetailsTableFormat[];
    setlistOfParkingDetails(tableData);
  }
};

const newParkingModalToggle = (): void => {
  const newValue = !openNewParkingModal;
  setOpenNewParkingModal(newValue);
};

const createNewParking = async (): Promise<object> => {
  if (!selectedVehicleType) {
    return {}
  }

  setIsCreatingNewParking(true); 
  const response = await apiService({ 
    method: 'POST', 
    endpoint: '/process', 
    body: {
      vehicleType: selectedVehicleType
    }
  }) as APIResponse;

  if (response.status === 200) {
    setIsCreatingNewParking(false); 
    setSelectedVehicleType(null);
    newParkingModalToggle();
    fetchParkingDetails();
  }
  return {}
}

const createPaymentInvoice = async (data: ParkingDetails): Promise<object> => {
  const response = await apiService({
    method: 'POST',
    endpoint: '/create-payment',
    body: {
      referenceNo: data.parkingReferenceNo,
      paymentType: data.paymentType
    }
  }) as APIResponse;
  if (response.status === 200) {  
    const generatedInvoice = response.data as unknown as GeneratedInvoice;
    setGeneratedInvoice(generatedInvoice);
    fetchParkingDetails();
  }
  return {}
}


const invoiceModal = () => {
  return (
    <Modal
    open={true}
    >
      test
    </Modal>
  )
}


const columns: TableProps<ParkingDetailsTableFormat>['columns'] = [
  {
    title: 'Reference Number',
    dataIndex: 'referenceNo',
    key: 'referenceNo',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Paid',
    dataIndex: 'isPaid',
    key: 'isPaid',
  },
  {
    title: 'Amount',
    dataIndex: 'amountToPay',
    key: 'amountToPay',
  },
  {
    title: 'Payment Method',
    dataIndex: 'paymentType',
    key: 'paymentType',
  },
  {
    title: 'Parking Level',
    dataIndex: 'parkingLevel',
    key: 'parkingLevel'
  },
  {
    title: 'Vehicle Type',
    dataIndex: 'vehicleType',
    key: 'vehicleType'
  },
  {
    title: 'Start Time',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: 'Action',
    dataIndex: 'data',
    key: 'key',
    render: (data: ParkingDetails) => (
      <>
        <Space size="middle">
          <Button onClick={()=> createPaymentInvoice(data)}> 
              Create Payment Invoice
          </Button>
        </Space>
      </>
    ),
  },
];

useEffect( () => {
  fetchParkingDetails();
},[]);


  return (
    <div className="App">
      <Space>
        <Button type='primary' onClick={newParkingModalToggle}>Create New Parking</Button>
      </Space>
      <Table 
        dataSource={listOfParkingDetails}
        bordered={true}
        columns={columns} 
        />
       <Modal
        title="Create New Parking Record"
        open={openNewParkingModal}
        onOk={createNewParking}
        confirmLoading={isCreatingNewParking}
        onCancel={newParkingModalToggle}
      >
        <Space
          direction="vertical" style={{ width: '100%' }}
        >
          <Select 
            style={{ width: 200 }}
            placeholder="Select Vehicle Type"
            onChange={(e: string) => setSelectedVehicleType(e)}
            options={[
              {
                value: "4W",
                label: "4 wheels"
              },
              {
                value: "2W",
                label: "2 wheels"
              }
            ]}
          />
        </Space>
      </Modal>
      {invoiceModal()}
    </div>
  );
};

export default App;