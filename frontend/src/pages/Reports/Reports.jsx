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
    const [pendingReports, setPendingReports] = useState([]);
    const [completedReports, setCompletedReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all invoices with populated user and test template data
            const invoicesResponse = await axios.get('http://localhost:5002/api/invoices');
            const invoices = invoicesResponse.data;
            
            // Log the first invoice's test templates in detail
            if (invoices.length > 0) {
                console.log('First invoice test templates:', JSON.stringify(invoices[0].testTemplates, null, 2));
            }
            
            // Separate pending and completed reports
            const pending = [];
            const completed = [];
            
            // Process all invoices
            for (const invoice of invoices) {
                console.log('Processing invoice test templates:', {
                    invoiceId: invoice._id,
                    templates: invoice.testTemplates.map(t => ({
                        _id: t._id,
                        name: t.name,
                        templateName: t.templateName,
                        allFields: t
                    }))
                });

                // Check if all templates are completed
                const allTemplatesCompleted = invoice.testTemplates.every(t => t.completed);
                const invoiceStatus = allTemplatesCompleted ? 'Completed' : 'Pending';

                const report = {
                    invoiceId: invoice._id,
                    patientName: `${invoice.userId?.title || ''} ${invoice.userId?.name || 'Unknown'}`,
                    userId: invoice.userId?._id,
                    testTemplates: invoice.testTemplates.map(template => {
                        // Log each template's data
                        console.log('Template data:', {
                            _id: template._id,
                            name: template.name,
                            templateName: template.templateName,
                            allFields: template
                        });
                        
                        return {
                            _id: template._id,
                            name: template.templateName || template.name || 'Test Name Not Available',
                            category: template.category || 'Uncategorized',
                            completed: template.completed || false
                        };
                    }),
                    date: new Date(invoice.date).toLocaleDateString(),
                    status: invoiceStatus,
                    amount: invoice.amount,
                    paymentType: invoice.paymentType,
                    paymentStatus: invoice.paymentStatus
                };

                if (allTemplatesCompleted) {
                    completed.push(report);
                } else {
                    pending.push(report);
                }
            }
            
            console.log('Pending reports:', pending);
            console.log('Completed reports:', completed);
            
            setPendingReports(pending);
            setCompletedReports(completed);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('Failed to fetch reports. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCreateReport = (template) => {
        if (template.completed) {
            alert('This test has already been completed');
            return;
        }
        navigate(`/create-report/${template._id}`, {
            state: {
                invoiceId: selectedReport.invoiceId,
                patientId: selectedReport.userId,
                patientName: selectedReport.patientName
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

    const handleViewReport = (reportId) => {
        navigate(`/testReports/${reportId}`);
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
                    Reports
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Pending" />
                    <Tab label="Completed" />
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
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment Type</TableCell>
                                <TableCell>Payment Status</TableCell>
                                <TableCell>Tests</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(tabValue === 0 ? pendingReports : completedReports).map((report) => (
                                <TableRow key={report.invoiceId || report._id}>
                                    <TableCell>{report.patientName}</TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>Rs. {report.amount}</TableCell>
                                    <TableCell>{report.paymentType}</TableCell>
                                    <TableCell>{report.paymentStatus}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {report.testTemplates?.map((test, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={test.name}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                    {test.category && test.category !== 'Uncategorized' && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {test.category}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {tabValue === 0 ? (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setCreateDialogOpen(true);
                                                }}
      >
        Create Report
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleViewReport(report._id)}
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
