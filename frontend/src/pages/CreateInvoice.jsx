import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [testTemplates, setTestTemplates] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [formData, setFormData] = useState({
        userId: '',
        paymentType: 'Cash',
        dueDate: '',
        notes: ''
    });
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        title: 'Mr',
        address: '',
        gender: 'Not Selected',
        dob: '',
        age: {
            years: 0,
            months: 0
        }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filteredTests, setFilteredTests] = useState([]);
    const [searchError, setSearchError] = useState('');
    const searchTimeoutRef = useRef(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userSearchError, setUserSearchError] = useState('');
    const userSearchTimeoutRef = useRef(null);
    const [isUserSearchFocused, setIsUserSearchFocused] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchTestTemplates();
    }, []);

    // Debounce search
    useEffect(() => {
        if (!isSearchFocused) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            if (searchTerm && searchTerm.trim()) {
                searchTestTemplates();
            } else {
                setFilteredTests(testTemplates);
            }
        }, 500); // Increased debounce time

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, testTemplates, isSearchFocused]);

    // Debounce user search
    useEffect(() => {
        if (!isUserSearchFocused) return;

        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        userSearchTimeoutRef.current = setTimeout(() => {
            if (userSearchTerm && userSearchTerm.trim()) {
                searchUsers();
            } else {
                setFilteredUsers(users);
            }
        }, 500);

        return () => {
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
        };
    }, [userSearchTerm, users, isUserSearchFocused]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5002/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTestTemplates = async () => {
        try {
            setLoading(true);
            console.log('Fetching all test templates...');
            const response = await axios.get('http://localhost:5002/api/testTemplates');
            console.log('All templates response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setTestTemplates(response.data);
                setFilteredTests(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setError('Error: Unexpected data format received from server');
            }
        } catch (error) {
            console.error('Error fetching test templates:', error);
            if (error.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Please make sure the backend is running.');
            } else if (error.response) {
                console.error('Server response:', error.response.data);
                setError(error.response.data.message || 'Error loading test templates');
            } else {
                setError('Error loading test templates. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const searchTestTemplates = async () => {
        try {
            setLoading(true);
            setSearchError('');
            
            // Don't search if the term is too short
            if (searchTerm.length < 2) {
                setFilteredTests(testTemplates);
                return;
            }

            console.log('Making search request with term:', searchTerm);
            const response = await axios.get(`http://localhost:5002/api/testTemplates/search`, {
                params: {
                    templateName: searchTerm,
                    shortName: searchTerm
                }
            });
            
            console.log('Search response:', response.data);
            
            // The backend now returns an array directly
            if (Array.isArray(response.data)) {
                setFilteredTests(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setFilteredTests([]);
            }
        } catch (error) {
            console.error('Error searching test templates:', error);
            if (error.response) {
                // Server returned an error response
                const errorMessage = error.response.data?.message || 'Error searching tests';
                const errorDetails = error.response.data?.error || '';
                console.error('Server error details:', error.response.data);
                setSearchError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            } else if (error.request) {
                // Request was made but no response received
                console.error('No response received:', error.request);
                setSearchError('No response from server. Please try again.');
            } else {
                // Something else happened
                console.error('Other error:', error.message);
                setSearchError('Error searching tests. Please try again.');
            }
            setFilteredTests([]);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        try {
            setLoading(true);
            setUserSearchError('');
            
            // Don't search if the term is too short
            if (userSearchTerm.length < 2) {
                setFilteredUsers(users);
                return;
            }

            console.log('Making user search request with term:', userSearchTerm);
            const response = await axios.get(`http://localhost:5002/api/users/search`, {
                params: {
                    name: userSearchTerm
                }
            });
            
            console.log('User search response:', response.data);
            
            if (Array.isArray(response.data)) {
                setFilteredUsers(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setFilteredUsers([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Error searching users';
                const errorDetails = error.response.data?.error || '';
                console.error('Server error details:', error.response.data);
                setUserSearchError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                setUserSearchError('No response from server. Please try again.');
            } else {
                console.error('Other error:', error.message);
                setUserSearchError('Error searching users. Please try again.');
            }
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (event, newValue) => {
        if (newValue) {
            // Set the selected user ID
            setFormData({ ...formData, userId: newValue._id });
            
            // Auto-fill the new user form
            setNewUser({
                name: newValue.name,
                email: newValue.email,
                phone: newValue.phone,
                title: newValue.title || 'Mr',
                address: newValue.address || '',
                gender: newValue.gender || 'Not Selected',
                dob: newValue.dob || '',
                age: {
                    years: newValue.age?.years || 0,
                    months: newValue.age?.months || 0
                }
            });
            
            // Clear search and close dropdown
            setUserSearchTerm('');
            setIsUserSearchFocused(false);
        }
    };

    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        
        // Handle age fields separately
        if (name === 'ageYears' || name === 'ageMonths') {
            setNewUser(prev => ({
                ...prev,
                age: {
                    ...prev.age,
                    [name === 'ageYears' ? 'years' : 'months']: parseInt(value) || 0
                }
            }));
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    const handleTestSelect = (event, newValue) => {
        console.log('Selected test:', newValue);
        if (newValue && !selectedTests.find(t => t._id === newValue._id)) {
            setSelectedTests([...selectedTests, newValue]);
            setSearchTerm('');
        }
    };

    const handleRemoveTest = (testId) => {
        setSelectedTests(selectedTests.filter(test => test._id !== testId));
    };

    const calculateTotal = () => {
        return selectedTests.reduce((total, test) => total + test.price, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let userId = formData.userId;

            // If creating new user
            if (!userId && newUser.name) {
                const userResponse = await axios.post('http://localhost:5002/api/users', newUser);
                userId = userResponse.data._id;
            }

            if (!userId) {
                setError('Please select a user or create a new one');
                return;
            }

            if (selectedTests.length === 0) {
                setError('Please select at least one test');
                return;
            }

            const invoiceData = {
                userId,
                testTemplateId: selectedTests[0]._id,
                paymentType: formData.paymentType,
                amount: calculateTotal(),
                dueAmount: calculateTotal(),
                dueDate: formData.dueDate,
                notes: formData.notes
            };

            await axios.post('http://localhost:5002/api/invoices', invoiceData);
            setSuccess('Invoice created successfully');
            setTimeout(() => {
                navigate('/invoices');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating invoice');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Create New Invoice
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* User Selection/Creation */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    User Information
                                </Typography>
                                <Autocomplete
                                    options={filteredUsers}
                                    getOptionLabel={(option) => 
                                        `${option.name} - ${option.phone}`
                                    }
                                    value={users.find(user => user._id === formData.userId) || null}
                                    onChange={handleUserSelect}
                                    inputValue={userSearchTerm}
                                    onInputChange={(event, newInputValue) => {
                                        setUserSearchTerm(newInputValue);
                                    }}
                                    onFocus={() => setIsUserSearchFocused(true)}
                                    onBlur={() => {
                                        setTimeout(() => setIsUserSearchFocused(false), 200);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Users"
                                            fullWidth
                                            margin="normal"
                                            placeholder="Type at least 2 characters to search"
                                            error={!!userSearchError}
                                            helperText={userSearchError}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li key={option._id} {...props}>
                                            {option.name}
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                {option.phone} - {option.email}
                                            </Typography>
                                        </li>
                                    )}
                                    loading={loading}
                                    loadingText="Loading users..."
                                    noOptionsText={userSearchError || "No users found"}
                                    freeSolo={false}
                                    clearOnBlur={false}
                                    clearOnEscape={false}
                                    filterOptions={(options, state) => options}
                                    open={isUserSearchFocused}
                                />

                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                    Or Create New User
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={newUser.name}
                                            onChange={handleNewUserChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Phone"
                                            name="phone"
                                            value={newUser.phone}
                                            onChange={handleNewUserChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={newUser.email}
                                            onChange={handleNewUserChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Age (Years)"
                                            name="ageYears"
                                            type="number"
                                            value={newUser.age.years}
                                            onChange={handleNewUserChange}
                                            InputProps={{ inputProps: { min: 0 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Age (Months)"
                                            name="ageMonths"
                                            type="number"
                                            value={newUser.age.months}
                                            onChange={handleNewUserChange}
                                            InputProps={{ inputProps: { min: 0, max: 11 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={newUser.address}
                                            onChange={handleNewUserChange}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Test Selection */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Test Selection
                                </Typography>
                                {loading ? (
                                    <Typography>Loading tests...</Typography>
                                ) : (
                                    <>
                                        <Autocomplete
                                            options={filteredTests}
                                            getOptionLabel={(option) => 
                                                `${option.templateName} (${option.shortName}) - Rs. ${option.price}`
                                            }
                                            value={null}
                                            onChange={handleTestSelect}
                                            inputValue={searchTerm}
                                            onInputChange={(event, newInputValue) => {
                                                setSearchTerm(newInputValue);
                                            }}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => {
                                                setTimeout(() => setIsSearchFocused(false), 200);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Search Tests"
                                                    fullWidth
                                                    margin="normal"
                                                    placeholder="Type at least 2 characters to search"
                                                    error={!!searchError}
                                                    helperText={searchError}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li key={option._id} {...props}>
                                                    {option.templateName}
                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                        ({option.shortName}) - Rs. {option.price}
                                                    </Typography>
                                                </li>
                                            )}
                                            loading={loading}
                                            loadingText="Loading tests..."
                                            noOptionsText={searchError || "No tests found"}
                                            freeSolo={false}
                                            clearOnBlur={false}
                                            clearOnEscape={false}
                                            filterOptions={(options, state) => options}
                                            open={isSearchFocused}
                                        />

                                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Test Name</TableCell>
                                                        <TableCell>Short Name</TableCell>
                                                        <TableCell>Price</TableCell>
                                                        <TableCell>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedTests.map(test => (
                                                        <TableRow key={test._id}>
                                                            <TableCell>{test.templateName}</TableCell>
                                                            <TableCell>{test.shortName}</TableCell>
                                                            <TableCell>Rs. {test.price}</TableCell>
                                                            <TableCell>
                                                                <IconButton onClick={() => handleRemoveTest(test._id)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Invoice Details */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Invoice Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Payment Type</InputLabel>
                                            <Select
                                                value={formData.paymentType}
                                                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                                label="Payment Type"
                                            >
                                                <MenuItem value="Cash">Cash</MenuItem>
                                                <MenuItem value="Card">Card</MenuItem>
                                                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                                <MenuItem value="Online Payment">Online Payment</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Due Date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total and Submit */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Total Amount: Rs. {calculateTotal()}
                                </Typography>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<AddIcon />}
                                >
                                    Create Invoice
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default CreateInvoice; 