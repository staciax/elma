'use client';

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import { use } from 'react';
import type { UserPublic } from '../types';

type UserContextType = {
	user: UserPublic | null;
	setUser: (user: UserPublic | null) => void;
};

const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => {},
});

export function useUser(): UserContextType {
	const context = useContext(UserContext);
	if (context === null) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}

type Props = {
	children: ReactNode;
	userPromise: Promise<UserPublic | null>;
};

export function UserProvider({ children, userPromise }: Props) {
	const initialUser = use(userPromise);
	const [user, setUser] = useState<UserPublic | null>(initialUser);

	useEffect(() => {
		setUser(initialUser);
	}, [initialUser]);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
}
