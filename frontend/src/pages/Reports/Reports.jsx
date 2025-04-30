import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reports = () => {
    const [tabValue, setTabValue] = useState(0);
    const [pendingTests, setPendingTests] = useState([]);
    const [completedTests, setCompletedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all invoices with populated test templates
            const invoicesResponse = await axios.get('http://localhost:5002/api/invoices');
            const invoices = invoicesResponse.data;
            
            // Process all tests from invoices
            const allTests = [];
            invoices.forEach(invoice => {
                if (invoice.testTemplates && invoice.testTemplates.length > 0) {
                    invoice.testTemplates.forEach(test => {
                        allTests.push({
                            _id: test._id,
                            invoiceId: invoice._id,
                            patientName: `${invoice.userId?.title || ''} ${invoice.userId?.name || 'Unknown'}`,
                            userId: invoice.userId?._id,
                            testName: test.templateName || test.name || 'Test Name Not Available',
                            category: test.category || 'Uncategorized',
                            date: new Date(invoice.createdAt).toLocaleDateString(),
                            amount: test.price || 0,
                            paymentType: invoice.paymentType,
                            paymentStatus: invoice.paymentStatus,
                            completed: test.completed || false
                        });
                    });
                }
            });
            
            // Separate pending and completed tests
            const pending = allTests.filter(test => !test.completed);
            const completed = allTests.filter(test => test.completed);
            
            setPendingTests(pending);
            setCompletedTests(completed);
        } catch (error) {
            console.error('Error fetching tests:', error);
            setError('Failed to fetch tests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCreateReport = (test) => {
        if (test.completed) {
            alert('This test has already been completed');
            return;
        }
        navigate(`/create-report/${test._id}`, {
            state: {
                invoiceId: test.invoiceId,
                patientId: test.userId,
                patientName: test.patientName
            }
        });
    };

    const handleTemplateSelect = (template) => {
        // Log the exact data we're working with
        console.log('Full Selected Report:', JSON.stringify(selectedReport, null, 2));
        console.log('Selected Template:', template);
        
        // Ensure we have the required data
        if (!selectedReport || !selectedReport.invoiceId || !selectedReport.userId) {
            console.error("Missing required data in selected report:", selectedReport);
            return;
        }

        // Construct the navigation state with explicit values
        const navigationState = {
            invoiceId: selectedReport.invoiceId,
            patientName: selectedReport.patientName,
            patientId: selectedReport.userId
        };
        
        // Log the exact state being passed
        console.log('Exact Navigation State:', JSON.stringify(navigationState, null, 2));
        
        // Navigate to create report page
        setSelectedTemplate(template);
        handleCloseDialog();
        
        // Navigate immediately without setTimeout
        navigate(`/create-report/${template._id}`, { 
            state: navigationState 
        });
    };

    const handleCloseDialog = () => {
        setCreateDialogOpen(false);
        setSelectedReport(null);
    };

    const handleViewReport = (testId) => {
        navigate(`/testReports/${testId}`);
    };

    const renderTestTemplates = () => {
        if (!selectedReport) return null;

        return (
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Test Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedReport.testTemplates.map((template) => (
                        <div
                            key={template._id}
                            className={`p-4 border rounded-lg cursor-pointer ${
                                template.completed ? 'bg-green-100' : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => handleCreateReport(template)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{template.name}</h4>
                                    <p className="text-sm text-gray-600">{template.category}</p>
                                </div>
                                {template.completed && (
                                    <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Test Reports
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Pending Tests" />
                    <Tab label="Completed Tests" />
                </Tabs>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient Name</TableCell>
                                <TableCell>Test Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment Type</TableCell>
                                <TableCell>Payment Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(tabValue === 0 ? pendingTests : completedTests).map((test) => (
                                <TableRow key={test._id}>
                                    <TableCell>{test.patientName}</TableCell>
                                    <TableCell>{test.testName}</TableCell>
                                    <TableCell>{test.category}</TableCell>
                                    <TableCell>{test.date}</TableCell>
                                    <TableCell>Rs. {test.amount}</TableCell>
                                    <TableCell>{test.paymentType}</TableCell>
                                    <TableCell>{test.paymentStatus}</TableCell>
                                    <TableCell>
                                        {tabValue === 0 ? (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleCreateReport(test)}
                                            >
                                                Create Report
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleViewReport(test._id)}
                                            >
                                                View Report
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={createDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create Test Report</DialogTitle>
                <DialogContent>
                    {selectedReport && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Patient: {selectedReport.patientName}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Date: {selectedReport.date}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Select Test to Create Report:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {selectedReport.testTemplates?.map((test, index) => (
                                    <Paper 
                                        key={index} 
                                        elevation={2} 
                                        sx={{ 
                                            p: 2, 
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            }
                                        }}
                                        onClick={() => handleTemplateSelect(test)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={test.name}
                                                color="primary"
                                                variant="outlined"
                                            />
                                            {test.category && test.category !== 'Uncategorized' && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {test.category}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {renderTestTemplates()}
        </Box>
    );
};

export default Reports;
