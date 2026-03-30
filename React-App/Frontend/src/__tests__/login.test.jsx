import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom'
import Login from '../components/Login';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

jest.mock('firebase/auth');
jest.mock('../firebase/firebase', () => ({
    auth: {}
}));
jest.mock('react-router-dom');


const mockNavigate = jest.fn();
useNavigate.mockReturnValue(mockNavigate);

describe('Login Component', () => {
    beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    });
    it('should render email and password fields', () => {
        render(<Login/>);
        expect(screen.getByLabelText('email')).toBeInTheDocument();
        expect(screen.getByLabelText('password')).toBeInTheDocument();
    });
    it('should show login button renders', () => {
        render(<Login/>);
        expect(screen.getByRole('button', {name: /login/i })).toBeInTheDocument();
    })
    it('should show error message on failed login', async () => {
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error ('Invalid Crdentials'));
        render(<Login/>);
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'test@email.com' } });
        fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123' } });
        fireEvent.submit(screen.getByRole('button', {name: /login/i }));
        await screen.findByText('Invalid email or password.');
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    })
    it('should successfully navigate user to dashboard', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({user: {uid: '123', email: 'test@email.com'}});
        render(<Login/>);
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'test@email.com' } });
        fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123' } });
        fireEvent.submit(screen.getByRole('button', {name: /login/i }));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    })
    it('should show loading state when submitting', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({user: {uid: '123', email: 'test@email.com'}});
        render(<Login/>)
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'test@email.com' } });
        fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', {name: /login/i }));
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
        });
    })
    it('should be disbaled while loading', async () => {
        signInWithEmailAndPassword.mockResolvedValueOnce({user: {uid: '123', email: 'test@email.com'}});
        render(<Login/>)
        fireEvent.change(screen.getByLabelText('email'), { target: { value: 'test@email.com' } });
        fireEvent.change(screen.getByLabelText('password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', {name: /login/i }));
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
        });
    })
});

it('should show authentication error for wrong password', async () => {
  signInWithEmailAndPassword.mockRejectedValueOnce(
    new Error('Invalid credentials')
  );

  render(<Login />);

  fireEvent.change(screen.getByLabelText('email'), {
    target: { value: 'test@example.com' },
  });

  fireEvent.change(screen.getByLabelText('password'), {
    target: { value: 'wrongpassword' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(
    await screen.findByText('Invalid email or password.')
  ).toBeInTheDocument();
});
it('should show authentication error for wrong email', async () => {
  
  signInWithEmailAndPassword.mockRejectedValueOnce(
    new Error('Invalid credentials')
  );

  render(<Login />);

  
  fireEvent.change(screen.getByLabelText('email'), {
    target: { value: 'wrong@example.com' },
  });

  fireEvent.change(screen.getByLabelText('password'), {
    target: { value: '123456' },
  });

  
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  
  expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
});

it('should call login function with correct credentials', async () => {
  signInWithEmailAndPassword.mockResolvedValueOnce({});

  render(<Login />);

  fireEvent.change(screen.getByLabelText('email'), {
    target: { value: 'test@example.com' },
  });

  fireEvent.change(screen.getByLabelText('password'), {
    target: { value: '123456' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      '123456'
    );
  });
});