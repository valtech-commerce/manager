// Common
//------------------------------------
declare type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

// Enums
//------------------------------------
declare enum RepositoryType {
	SinglePackage = "single-package",
	MultiPackage = "multi-package",
}

declare enum NodeType {
	Commonjs = "commonjs",
	Module = "module",
}

declare enum BrowserType {
	Script = "script",
	Module = "module",
}

declare enum SyntaxType {
	JavaScript = "javascript",
	TypeScript = "typescript",
}

// Initialize options
//------------------------------------
declare type DistributionChoices = "node" | "browser";

declare type Terminal = object;
declare type TaskHooks = {
	preRun?: ({ terminal }: { terminal: Terminal }) => void;
	postRun?: ({ terminal }: { terminal: Terminal }) => void;
};

declare type ManagerOptions = {
	repositoryType: RepositoryType;
	dist: RequireAtLeastOne<
		{
			source?: string;
			destination?: string;
			node?: {
				type?: NodeType;
				target?: string;
			};
			browser?: {
				type: BrowserType;
				target?: string;
				name?: string;
				externals?: {
					[index: string]: string;
				};
			}[];
			syntax?: SyntaxType;
			include?: string[];
		},
		DistributionChoices
	>;
	tasks?: {
		outdated?: TaskHooks;
		build?: TaskHooks;
		watch?: TaskHooks;
		documentation?: TaskHooks;
		prepare?: TaskHooks;
		version?: TaskHooks;
		rebuild?: TaskHooks;
	};
};

// Manager
//------------------------------------
declare class Manager {
	constructor();
	testOutdated(absolutePath: string): Promise<void>;
	init(options: ManagerOptions): Promise<void>;
}

declare const manager: Manager;

export default Manager;

// Enums
export { RepositoryType, NodeType, BrowserType, SyntaxType };
