import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Print as PrintIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

const InvoiceManager = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5002/api/invoices');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch invoices');
            }
            const data = await response.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError(error.message || 'Failed to fetch invoices. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setViewDialogOpen(true);
    };

    const handlePrintInvoice = async (invoice) => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch complete invoice data with populated test templates
            const response = await axios.get(`http://localhost:5002/api/invoices/${invoice._id}`);
            const completeInvoice = response.data;
            
            // Generate PDF using the complete data
            const pdf = generateInvoicePDF(
                completeInvoice,
                completeInvoice.userId,
                completeInvoice.testTemplates
            );
            
            // Save and download the PDF
            pdf.save(`invoice_${invoice._id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setError(error.message || 'Failed to generate PDF. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInvoice = async () => {
        try {
            await axios.delete(`http://localhost:5002/api/invoices/${selectedInvoice._id}`);
            setDeleteDialogOpen(false);
            setSelectedInvoice(null);
            fetchInvoices();
        } catch (error) {
            setError('Failed to delete invoice');
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice._id.toLowerCase().includes(searchLower) ||
            invoice.paymentType.toLowerCase().includes(searchLower) ||
            invoice.paymentStatus.toLowerCase().includes(searchLower)
        );
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'success';
            case 'Pending':
                return 'warning';
            case 'Partial':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h5" gutterBottom>
                            Invoice Manager
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                            }}
                        />
                    </Grid>
                </Grid>
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
                                <TableCell>Invoice ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((invoice) => (
                                    <TableRow key={invoice._id}>
                                        <TableCell>{invoice._id}</TableCell>
                                        <TableCell>
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>Rs. {invoice.amount}</TableCell>
                                        <TableCell>{invoice.paymentType}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={invoice.paymentStatus}
                                                color={getStatusColor(invoice.paymentStatus)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleViewInvoice(invoice)}
                                                color="primary"
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handlePrintInvoice(invoice)}
                                                color="primary"
                                            >
                                                <PrintIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredInvoices.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            )}

            {/* View Invoice Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogContent>
                    {selectedInvoice && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Invoice ID:</Typography>
                                <Typography>{selectedInvoice._id}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Date:</Typography>
                                <Typography>
                                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Amount:</Typography>
                                <Typography>Rs. {selectedInvoice.amount}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Payment Type:</Typography>
                                <Typography>{selectedInvoice.paymentType}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1">Status:</Typography>
                                <Chip
                                    label={selectedInvoice.paymentStatus}
                                    color={getStatusColor(selectedInvoice.paymentStatus)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">Notes:</Typography>
                                <Typography>{selectedInvoice.notes || 'No notes'}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Invoice</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this invoice? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteInvoice} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvoiceManager; 