import type { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Social Links')
        .id('socialLinksSingleton')
        .child(S.document().schemaType('socialLinks').documentId('socialLinks')),
      S.listItem()
        .title('About page')
        .id('aboutPageSingleton')
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'aboutPage' && item.getId() !== 'socialLinks',
      ),
    ]);
