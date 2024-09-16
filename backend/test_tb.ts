import { Value } from '@sinclair/typebox/value';
import { t } from 'elysia';

// const T = t.Object({
// 	x: t.String({ format: 'email', maxLength: 320 }),
// });

// const x = Value.Check(T, {
// 	x: 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest@gmail.com',
// });
// console.log(x);

// const D = Value.Decode(R, '01918976-ee73-799b-85ff-bce62f942489;authors;1,01918977-1df4-7bbb-a5a5-f875b1d9a5f5;authors;2');

// const A = Value.Create(R);
// console.log(A);

// const B = Value.Check(R, {
// 	authors:
// 		'01918976-ee73-799b-85ff-bce62f942489;authors;1,01918977-1df4-7bbb-a5a5-f875b1d9a5f5;authors;2',
// });
// console.log(B);

const T = t
	.Transform(t.Array(t.Number()))
	.Decode((value) => new Set(value))
	.Encode((value) => [...value]);

const A = Value.Check(T, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
// console.log(A);

const B = Value.Decode(T, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
// console.log(B);

const C = Value.Encode(T, new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
// console.log(C);

const Author = t.Object({
	id: t.String({ format: 'uuid' }),
	first_name: t.String(),
	last_name: t.String(),
});

const R = t.Object({
	authors: t
		.Transform(t.Array(Author))
		.Decode((value) => {
			const authors = value.map((author) => {
				return {
					id: author.id,
					first_name: author.first_name,
					last_name: author.last_name,
				};
			});
			return authors;
		})
		.Encode((value) => {
			return value.map((author) => {
				return {
					id: author.id,
					first_name: author.first_name,
					last_name: author.last_name,
				};
			});
		}),
});

const D = Value.Encode(R, [
	{
		id: '01918976-ee73-799b-85ff-bce62f942489',
		first_name: 'John',
		last_name: 'Doe',
	},
	{
		id: '01918977-1df4-7bbb-a5a5-f875b1d9a5f5',
		first_name: 'Jane',
		last_name: 'Doe',
	},
]);

// const R = t.Object({
// 	authors: t
// 		.Transform(t.Array(Author))
// 		.Decode((value) => {
// 			// const authors = value.map((author) => {
// 			// 	return {
// 			// 		id: author.id,
// 			// 		first_name: author.first_name,
// 			// 		last_name: author.last_name,
// 			// 	};
// 			// });
// 			return value;
// 		})
// 		.Encode((value) => {
// 			return [
// 				{
// 					id: '1',
// 					first_name: '1',
// 					last_name: '1',
// 				},
// 			];
// 		}),
// });

// const D = Value.Encode(R, [
// 	{
// 		id: '01918976-ee73-799b-85ff-bce62f942489',
// 		first_name: 'John',
// 		last_name: 'Doe',
// 	},
// 	{
// 		id: '01918977-1df4-7bbb-a5a5-f875b1d9a5f5',
// 		first_name: 'Jane',
// 		last_name: 'Doe',
// 	},
// ]);
// console.log(D);
