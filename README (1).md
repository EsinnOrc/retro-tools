# WEB - FE Code Review Checklist

## Genel Kurallar:

- Unit Test’ler yazılmalı.
- Componentlerin storyleri de yazılmalıdır.
- nested ternary kullanılacaksa fonksiyon olarak yazalım.
- Parent 'dan child a gönderilen fonksiyon isimleri handle ile başlamalı. Var olan component içinde yazılan fonksiyonların ismi on ile başlamalı bu sayede props olduğu daha rahat anlaşılabilir.
- import sorting, kullanılmayan ve duplicated importların silinmesine özen gösterilmelidir.
- div e ihtiyaç olmadığı durumlarda fragment kullanalım.(DOM clean and efficent).
- react vb library ve frameworklerin mutation icin kurallari var ve buna uymayi ihmal etmeyelim bunun icin ozellikle array methodlarini kullanirken push, pop vb kullanmak yerine spread ederek kullanmaya ozen gosterelim.(https://doesitmutate.xyz/)(https://react.dev/reference/rules)(https://react.dev/learn/updating-arrays-in-state)
  ![array-mutated.png](..%2F..%2FPictures%2FScreenshots%2Farray-mutated.png)
- Loading işlemlerinde state tutmak yerine tanStack in loading state kullanılmalıdır.
```js
 
 const {
    data: captchaData,
    refetch: refetchCaptcha,
    isFetching: isFetchingCaptcha, // isLoading:isLoadingCaptcha
  } = useQuery({
    queryKey: [QueryKeyEnums.GET_CAPTCHA],
    queryFn: () => GetCaptchaService(),
  });

{!isFetching && (
            //render edilecek komponent
 )}
)
```
- render içinde function define etmeyelim. Logic render ın dışında kalmalı

```js
  //Tercih edilmeyen kullanım
return (
	<button onClick={() => dispatch(ACTION_TO_SEND_DATA)}> // NOTICE HERE
		This is a bad example
	</button>
)
```

```js
//Tercih edilen kullanım
const submitData = () => dispatch(ACTION_TO_SEND_DATA)

return (
	<button onClick={submitData}>
		This is a good example
	</button>
)
```
-  string props ta süslü parantez kullanmayalım.

```js
<Paragraph variant={"h5"} heading={"bad"} />

<Paragraph variant="h5" heading="good" />

```
- Componentler için açıklayıcı ve anlamlı isimler kullanılmalıdır. Components ve files isimlendirmeleri için PascalCase, boolean bir state i isimlendirmek için is, has, should ile başlayan örnek durum değişkenleri kullanılmalıdır. (Örnek; isOpen, hasError, shouldRender). Prop isimlendirmeleri için camelCase kullanmalıdır.
```tsx
// *Tercih edilmeyen kullanım*
<Foo
	UserName="hello"
	phone_number={12345678}
/>
```

```tsx
// *Tercih edilen kullanım*
<Foo
userName="hello"
phoneNumber={12345678}
/>
```
- Component ler function ve const şeklinde yaziliyor genel kullanım olarak function tercih edilmelidir.
- Proje içerisinde gerekmedikçe type yerine interfaces kullanımından kaçınılmalıdır.(extends, declaration merging problem )
- Açılan PR’lar maksimum 500 satır sayısında olmalı. Daha büyük PR’lar decline edilerek bölünerek iletilmesi istenecektir.
- Bir component 300 satırdan fazla olmamalı. Olduğu durumda logic style gibi parçalanabilir. Örnek : paymentForm/hooks (Fırat buraya comment ekleyecek)
- 3rd party kütüphane kullanılmadan önce TEAM-DC-DEV-FRONTEND-TC ekibinden görüş alınmalı.
- Componentinizi en tepeden saran wrapper class ının adı,
    - atom ise; a-trkclApp{ComponentAdi}
    - molecules ise; m-trkclApp{ComponentAdi} düzeninde olmalıdır.
- Bütün projelerde stil adlandırmaları bir kurala bağlıdır. Projenin uygunluğu göz önünde bulundurularak BEM(Block-Element-Modifier) css metodolojisine uygun olarak yazılmalıdır.
- px yerime rem kullanmamız gereken durumlarda bu fonksiyonu kullanabiliriz.

 <br />

```tsx
    @function rem($size) {
        $remSize: $size / 16px;
        @return #{$remSize}rem;
    } // rem.scss dosyasının import edilmesi yeterli
    
    .examplecssclass{
        rem(24px);
    }
 ```
<br />
- isMobile kullanımından kaçılmalıdır.

 <br />

```tsx
// Tercih edilmeyen kullanım ❌
      const footerClasses = className(styles['badge__footer'], {
    [styles['badge__footer--mobile']]: isMobile,
  });
   ```
<br />
- UI applerinin altındaki komponentler ortak komponent(reusable) olmalıdır. Bilgiler props olarak geçmelidir. Aksi durumda komponent başka ekipler tarafından kullanılmayacak hale gelecektir.
<br />
- Çok tekrarlı kodlarda kodu simplify etmeniz, okunaklı, fonksiyonel olması öncelikli hedef olmalıdır. Benzer kod bloklarının tekrarlanmaması, genel kullanıma uygun bileşenlerin ve fonksiyonların oluşturulması(DRY Methodology ve Functional Programming)


```tsx
// Tercih edilmeyen kullanım ❌
    <Link href={pageManagerData?.['social.x.url'] || ''}>
    <AtomImage
    src={urlParser(pageManagerData?.['social.x.logo'], true)}
    alt=""
    width={24}
    height={24}
    className={icon}
    />
    </Link>
    
    <Link href={pageManagerData?.['social.facebook.url'] || ''}>
    <AtomImage
    src={urlParser(pageManagerData?.['social.facebook.logo'], true)}
    alt=""
    width={24}
    height={24}
    className={icon}
    />
    </Link>
    
    <Link href={pageManagerData?.['social.insta.url'] || ''}>
    <AtomImage
    src={urlParser(pageManagerData?.['social.insta.logo'], true)}
    alt=""
    width={24}
    height={24}
    className={icon}
    />
    </Link>
 ```
 ```tsx
// Tercih edilen kullanım ✅
        const socialLinks = [
    { key: 'x', label: 'Extra Social Network' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'insta', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
];

<Link href={pageManagerData?.[`social.${key}.url`] || ''} key={key}>
    <AtomImage
        src={urlParser(pageManagerData?.[`social.${key}.logo`], true)}
        alt={label}
        width={24}
        height={24}
        className={icon}
    />
</Link>
        
```
<br />
- useState kullanımını zorunlu alanlar dışında azaltılması gerekmektedir. Boolean state tutulması gereken durumlarda useBoolean custom hook un kullanılması gerekmektedir.
    - UseBoolean custom hook'u:
     <br />

```tsx
        const exampleState = useBoolean(false);
        exampleState.value;
        exampleState.setTrue();
        exampleState.setFalse();
        exampleState.toggle();  
        
```
 <br />

- !important kullanımından kaçınılmalıdır. Eğer kullanılmak zorunda kalındıysa açıklaması yapılmalıdır.
- Mecbur kalınmadıkça inline-style kullanılmamalıdır. Kullanıldığı taktirde zorunda kalındıysa açıklaması yapılmalıdır.
    - Örnek:
      <br />
        ```tsx
            // Tercih edilmeyen kullanım ❌

            <div style={"color: #fff"}></div>
        ```
        <br />
- Gereksiz yorum satırı bırakılmamalıdır.
- .scss sayfalarında boş classlar verilmemelidir.
- Birbirlerini kapsayan class'lar nested yazılmalıdır.

    - Örnek:
      <br />
        ```scss
            a-wrapperName {
                &__content{}



                &--variantName{}
            }
        ```
        <br />
- Renkler ve fontlar tanımlanmış ortak style dosyalarından çekilmelidir. (@import '@others/assets/styles/fonts.scss'; @import '@others/assets/styles/colors.scss';)

- Eğer tek başına ortak bir class ya da yazılan custom scss dosyasından bir class çekilecekse classNames kullanıp bir değişkene atamaya gerek olmamalıdır.
    ```tsx
        // Tercih edilmeyen kullanım ❌
        const descriptionClasses = classNames('subtitle-2-bold',styles['badge__description']);
        
        // Tercih edilen kullanım ✅
        &__description {
          color: $gray-900;
          max-width: 42.5rem;
          @extend .subtitle-1-bold
        }
        <span className={ styles['badge__description']}>{headerText}</span>
    ```

- Üçden fazla Optional chaining kullanımından kaçınılmalıdır.

    - Örnek:
  
        ```tsx
        // Tercih edilmeyen kullanım ❌

        const value = object?.property1?.property2?.property3 || 'default';
        ```

        <br />

- Gereksiz tekrarlı html etiketleri kullanımı azaltılmalıdır. Eğer etiketin karşılığı antd kütüphanesinde bulunuyorsa kütüphane componenti tercih edilmelidir.

<br />

```tsx
// Tercih edilmeyen kullanım ❌
.actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: start;
    margin: 1rem 2rem;
    
    <div className={styles['actions']}>
        {buttonItems?.map((item, index) => (
            <div key={index}>
                <AtomButton
                    onClick={() => router.push(item.href)}
                    text={item.title}
                    variant="badge"
                />
            </div>
        ))}
    </div>
}
   ```

<br />

<br />

```tsx
// Tercih edilen kullanım ✅
.actions {
    margin: 1rem 2rem;
@media (max-width: 767px) {
        // gerekli kod satırı
    }
}
<Flex align='center' gap={8} justify='center' className={styles['actions']}>
    {buttonItems?.map((item, index) => (
        <div key={index}>
            <AtomButton
                onClick={() => router.push(item.href)}
                text={item.title}
                variant="badge"
            />
        </div>
    ))}
</Flex>
   ```

<br />

- Anlamlı değişken ve class isimlendirmeleri kullanılmalı(örneğin div1 gibi bir anlam ifade etmeyen adlandırılmalardan kaçınılmalı)

- Projede data fetching süreçleri React-query ile yapılmalıdır.https://tanstack.com/query/v5/docs/react/overview , https://tanstack.com/query/v5/docs/react/guides/ssr

    - Örnek:

        <br />

        ```tsx
            const { data } = useQuery({
                queryKey: ['GetTurkcellMember'],
                queryFn: getTurkcellMemberData,
            });
        ```

        <br />

- Projedeki formlar react-hook-form un wrapperi ile sarılmış ve yup kullanılarak validasyon işlemleri tamamlanmış olmalıdır.https://react-hook-form.com/get-started

- Projede store içerisindeki name değeri, diğer uygulamalar ile çakışmaması için proje ismi prefix i ile verilmeli.

    - Örnek:

        <br />

        ```tsx
        export const deneme = createSlice({
            name: '{projeIsmi}deneme',
            initialState,
            reducers: {
                increment: (state) => {
                    state.value += 1
                },
                decrement: (state) => {
                    state.value -= 1
                },
                incrementByAmount: (state, action) => {
                    state.value += action.payload
                },
            },
        })
        ```

        <br />

- Yüzdelik marginler verilmemeli. (absolute vs gibi gereken durumlar hariç).

  - Projeler genelinde kullanılacak ortak komponentler libs/dc-mfe-ui kütüphanesi altında geliştirilmeli ve bulunmalıdır. Import edilecek komponent için relative path belirtmeye gerek yok. Typescript tarafında komponentlerin export edildiği dosya '@dc-mfe-ui' ifadesine eşlenmiştir.

      - Örnek: 
    ```tsx
    const { data } = useQuery({queryKey: ['GetTurkcellMember'],queryFn: getTurkcellMemberData,});
    ```
- React.useState, React.useEffect, React.fragment şeklinde kullanımdan kaçınılmalıdır.

- Mevcutta üzerinde çalışılan bir işi çözen kütüphane var ise o kullanılmalı. Gereksiz kütüphane importlarından kaçınılmalıdır.

- undefined kontrolü eklenmelidir.

    <br />

    ```tsx
    if (formValues?.birthDate) {  
         }  
    ```

    <br />

- Koşul kullanımında eğer else yoksa "&&" operatörü kullanılmalıdır.

    <br />

    ```tsx
    // Tercih edilmeyen kullanım ❌

        {message ? (
        <p className={errorClasses}>{message}</p>
        ) : (
        <></>
      )}

    // Tercih edilen kullanım ✅

      {message && (<p className={errorClasses}>{message}</p>)}
    ```

    <br />
- Koşul işlemlerinde birden fazla koşul varsa, önce koşulun değili(!message) ile başlanması tercih edilmelidir.
- Try catch kullanılması gereken durumlar;

    - Örnek:
  <br />
    ```tsx
  try {
     const { data } = await serviceWithoutToken.post('/captcha/check', body);
     dispatch(setCurrentStep(2));
     return data;
  } catch (error) {
     dispatch(setErrorMessage(error?.response?.data?.errorDetail));
     throw error; // throw önemli return olmamalı. ❌ return error; ❌
  } finally {
     dispatch(setLoading(false));
  }
    ```

    <br />

- Try catch kullanılmaması gereken durumlar;

    - Örnek 1:

      <br />

    ```tsx

  try {
       const { data } = await serviceWithoutToken.post('/captcha/check', body);
       dispatch(setCurrentStep(2));
       return data;
       } catch (error) {
       //catch kısmında hiç bir işlem yoksa try catch kullanılmamalı. ❌
       throw error;
  }
    ```

    <br />

    - Örnek 2:

      <br />

    ```tsx

  try {
       const { data } = await serviceWithoutToken.post('/captcha/check', body);
       return data;
       } catch (error) {
       //catch kısmında hiç bir işlem yoksa try catch kullanılmamalı. ❌
       return error;
  }
    ```

    <br />

- GetServerSideProps içerisinden redirect işlemi;

    - Olmaması gereken; ❌

      <br />
    ```tsx
  export async function getServerSideProps(context) {
    const { res } = context;
    const { url } = context.req;

    if (url.startsWith('/yukle/tl-paket-yukle/success')) {
      res.writeHead(302, { Location: '/yukle/tl-paket-yukle' });
      res.end();
    }
  }
    ```

    <br />

    - Olması gereken; ✅

      <br />
    ```tsx
  export async function getServerSideProps(context) {
    const { res } = context;
    const { url } = context.req;

    if (url.startsWith('/yukle/tl-paket-yukle/success')) {
      res.setHeader("Cache-Control", "no-cache");
      return {
       redirect: {
        destination: '/yukle/tl-paket-yukle',
        statusCode:302
      },
    }
   }
  }
    ```

    <br />

- Sayfayı oluşturan ve login gerektirmeyen servis istekleri getServerSideProps içerisinde atılmalı. (Ağırlık olarak pagemanager istekleri)


- Örnek:

    <br />
 ```tsx
    const Sayfa = () => {
     const getPukServiceStringsResponse = useQuery<GetPageManagerResponse>({
      queryKey: ['getPukServiceStrings'],
      queryFn: getPukServiceStrings, // yada ()=>getPukServiceStrings(parametre)
     });
     return (
      <>
       Sayfa İçeriği
      </>
     );
    };
    
    export const getServerSideProps = async (context) => {
      const queryClient = context.queryClient;
      await queryClient.fetchQuery({
       queryKey: ['getPukServiceStrings'],
       queryFn: getPukServiceStrings, // yada ()=>getPukServiceStrings(parametre)
     });
    
     return {
       props: {}, // genel olarak buradan bir şey return edilmemesi gerekiyor. Ekstrem caseler olabilir birlikte bakarız
     };
    };
    
    export default Sayfa;
    ```          
    <br />
