import { 
  Button, 
  Space, 
  Table, 
  Modal, 
  Select, 
  Input, 
  Form,
  Col, 
  Row,
  Card
} from 'antd';
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

interface Counts {
  occupied: number;
  available: number;
}

const App = () => {

const [listOfParkingDetails, setlistOfParkingDetails] = useState<ParkingDetailsTableFormat[]>([]);
const [isCreatingNewParking, setIsCreatingNewParking] = useState(false);
const [openNewParkingModal, setOpenNewParkingModal] = useState(false);
const [selectedVehicleType, setSelectedVehicleType] = useState<null|string>(null);
const [generatedInvoice, setGeneratedInvoice] = useState<null|GeneratedInvoice>(null)
const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
const [counts, setCounts] = useState<Counts>({
  occupied: 0,
  available: 0
});

const getCounts = async () => {
  const counts = await apiService({
    method: 'GET',
    endpoint: '/counts'
  }) as APIResponse;

  if (counts.status === 200) {

    const dataCounts = counts.data as unknown as Counts;
    setCounts({
      occupied: dataCounts.occupied,
      available: dataCounts.available
    })
  }
}

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
  } else {
    setlistOfParkingDetails([])
  }

  getCounts();
  
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
};

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
    setOpenInvoiceModal(true)
  }
  return {}
};

const payInvoicePayment = async (invoice: GeneratedInvoice) => {
  const processPayment = await apiService({
    method: "POST",
    endpoint: "/process-payment",
    body: {
      paymentMode: invoice.paymentMode,
      amountToPay: invoice.amountToPay,
      referenceNo: invoice.referenceNo,
      parkedHours: invoice.parkedHours
    }
  }) as APIResponse;
  
  if (processPayment.status === 200) {
    setOpenInvoiceModal(false);
    setGeneratedInvoice(null);
    fetchParkingDetails();
  }
  return processPayment;
};

const invoiceModalToggle = () => {
  const value = !openInvoiceModal;
  setGeneratedInvoice(null);
  setOpenNewParkingModal(value);
};

const invoiceModal = () => {
  if (openInvoiceModal && generatedInvoice) {
    return (
      <Modal
      open={openInvoiceModal}
      closeIcon={false}
      centered={true}
      okText="Paid"
      onCancel={invoiceModalToggle}
      onOk={()=>payInvoicePayment(generatedInvoice)}

      >
        <Form
           layout="vertical"
        >
        <Form.Item
          label="Parked Hours"
        >
          <Input value={generatedInvoice.parkedHours}/>
        </Form.Item>
        <Form.Item
          label="Amount To Pay"
        >
          <Input value={generatedInvoice.amountToPay}/>
        </Form.Item>
        <Form.Item
          label="Vehicle Description"
        >
          <Input value={generatedInvoice.vehicleDescription}/>
        </Form.Item>
        <Form.Item
          label="Reference No"
        >
          <Input value={generatedInvoice.referenceNo}/>
        </Form.Item>
        <Form.Item
          label="Reference No"
        >
          <Input value={generatedInvoice.paymentMode}/>
        </Form.Item>
      </Form>
      </Modal>
    )
  }
  
};

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
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Occupied" bordered={true}>
            {counts.occupied}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Available" bordered={true}>
          {counts.available}
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={true}>
          <Button type='primary' onClick={newParkingModalToggle}>
                Create New Parking
            </Button>
          </Card>
        </Col>
    </Row>
    <Row>
      <Col>
        <Table 
          dataSource={listOfParkingDetails}
          bordered={true}
          columns={columns} 
        />
      </Col>
    </Row>
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